import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@tickets/common";
import mongoose from "mongoose";
import { JsMsg } from "@nats-io/jetstream";
import { natsWrapper } from "../../../nats-wrapper";
import { mockPublish } from "../../../test/setup";

async function setup(){
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.nc, natsWrapper.jsm)

    // Create and save a ticket
    const ticket = Ticket.build({
        title: "concert",
        price: 99,
        userId: '1222333'
    })

    await ticket.save()

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + (15 * 60));

    // Create the fake data event
    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: expiration.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    }

    // @ts-ignore
    const msg: JsMsg= {
        ack: jest.fn()
    }

    return { listener, ticket , data, msg }
}

it("sets the orderId of the ticket", async ()=>{
    const { listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)
})

it("acks the message", async ()=>{
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it("publishes a ticket updated event", async ()=>{
    const { listener, ticket ,data, msg} = await setup()

    await listener.onMessage(data,msg)

    expect(mockPublish).toHaveBeenCalledTimes(1);
})