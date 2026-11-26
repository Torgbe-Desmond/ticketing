import mongoose from 'mongoose'
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@tickets/common"
import express, {Request, Response} from "express"
import { body} from "express-validator"
import { natsWrapper } from '../nats-wrapper'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { paystack } from '../../paystack'
import { Payment } from '../models/payments'
import { PaymemtCreatedPublisher } from '../events/publishers/payment-created-publisher'

const router  = express.Router()

const validators = [
    body("token")
      .not()
      .isEmpty()
      .withMessage("Token must be provided"),
    body("orderId")
      .not()
      .isEmpty()
      .custom((input)=>  mongoose.isValidObjectId(input))
      .withMessage("orderId must be provided")
]

router.post("/api/payments", 
    requireAuth,
    validators,
    validateRequest,
    async (req:Request,res:Response)=>{
     const { token, orderId } = req.body
     
     console.log("orderId", orderId)

     const order = await Order.findById(orderId)

     if(!order) {
        throw new NotFoundError()
     }
    
     // @ts-ignore
     if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
     }

     if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError("Cannot pay for a cancelled order")
     }

     const charge = await stripe.charges.create({
       currency:"ghc",
       amount:order.price * 100,
       source: token
     })

     const payment = Payment.build({
      orderId, 
      stripeId: new mongoose.Types.ObjectId().toHexString()
     })

     await payment.save()

     new PaymemtCreatedPublisher(natsWrapper.nc, natsWrapper.jsm).publish({
       id: payment.id,
       orderId: payment.orderId,
       stripeId: payment.stripeId
     })

     res.status(201).send({ success: true })
     
})

export { router as createChargeRouter }