import { TicketUpdatedListener } from "../ticket-upated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../../models/tickets";
import mongoose from "mongoose";
import { TicketCreatedEvent, TicketUpdatedEvent } from "@tickets/common";
import { JsMsg } from "@nats-io/jetstream";

async function setup(){
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.nc, natsWrapper.jsm)

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 300
    })

    await ticket.save()

    // Create a fake data object
    const data: TicketUpdatedEvent["data"] = {
        version:ticket.version + 1,
        id: ticket.id,
        title: "concert",
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // Create a fake msg object
    // @ts-ignore
    const msg: JsMsg = {
        ack:jest.fn()
    }
    
    // return all this stuff
    return { listener, ticket, data, msg}
}

it("finds, updates, and saves a ticket", async ()=>{
    const { msg, data, ticket, listener} = await setup();

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)

})

it("acks the message", async ()=>{
    const { listener , data, msg } = await setup()
    // call the onMessage function with the data object + message object
    await listener.onMessage(data,msg)
    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})

it("does not call ack if the event has a skipped version number", async ()=>{
    const { msg, data, listener} = await setup()
   
    data.version = 10;

    try {
        await listener.onMessage(data,msg)
    } catch (error) {
    }

    expect(msg.ack).not.toHaveBeenCalled()
})