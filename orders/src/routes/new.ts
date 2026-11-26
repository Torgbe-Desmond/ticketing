import mongoose from 'mongoose'
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@tickets/common"
import express, {Request, Response} from "express"
import {body} from "express-validator"
import { Ticket } from '../../models/tickets'
import { Order } from '../../models/orders'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router  = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60;
    
const validators = [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input:string)=> mongoose.Types.ObjectId.isValid(input))
      .withMessage("TickectId must be provided")
]

router.post("/api/orders", 
    requireAuth,
    validators,
    validateRequest,
    async (req:Request,res:Response)=>{
     const {ticketId} = req.body

     console.log("ticketId",ticketId)
    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);

    if(!ticket) throw new NotFoundError();

    // Make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved()

    if(isReserved){
        throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate the expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt:expiration,
        ticket
    })

    await order.save();

    // Publish and event saying that an order was created
    const publisher = new OrderCreatedPublisher(natsWrapper.nc, natsWrapper.jsm)

    await publisher.publish({
        id:order.id,
        status:order.status,
        userId: order.userId,
        expiresAt: expiration.toISOString(),
        version: order.version,
        ticket: {
            id: ticket.id,
            price: ticket.price 
        }
    })

    res.status(201).send(order)
})

export {router as newOrderRouter }