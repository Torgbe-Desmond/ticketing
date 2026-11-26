import { Listener, OrderCreatedEvent, OrderStatus, Subjects, } from "@tickets/common"
import { JsMsg } from "@nats-io/jetstream"
import { Ticket } from "../../../models/ticket"
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher"

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    durableName: string = "ticket-service"
    streamName: string = "ORDER"

    async onMessage(data:OrderCreatedEvent["data"], msg: JsMsg) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id)

        // If no ticket, throw error
        if(!ticket){
            throw new Error("Ticket not found")
        }

        // Mark the ticket as being reserved by setting the orderId property
        ticket.set({ orderId: data.id})

        // Save the ticket
        await ticket.save()

        await new TicketUpdatedPublisher(this.nc, this.jsm).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId:  data.id,
            version: ticket.version,
        });


        // ack the message
        msg.ack()
    }
}