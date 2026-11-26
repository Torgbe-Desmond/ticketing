import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@tickets/common"
import express, {Request, Response} from "express"
import { Order } from "../../models/orders"
import { param } from "express-validator"
import mongoose from "mongoose"
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'

const router  = express.Router()

const validators = [
    param("orderId")
    .not()
    .isEmpty()
    .custom((input:string)=> mongoose.Types.ObjectId.isValid(input))
    .withMessage("A valid orderId is required")
]

router.delete("/api/orders/:orderId", 
    requireAuth, 
    validators, 
    validateRequest, 
    async (req:Request,res:Response)=>{

    const order = await Order.findById(req.params.orderId).populate("ticket")
    
    if(!order) throw new NotFoundError()

    if(order.userId !== req.currentUser!.id) throw new NotAuthorizedError()

    order.status = OrderStatus.Cancelled

    await order.save()

    // publishing an event saying this was cancelled
    const publisher = new OrderCancelledPublisher(natsWrapper.nc,natsWrapper.jsm)

    publisher.publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })
    
    res.status(204).send(order)
})

export { router as deleteOrderRouter }