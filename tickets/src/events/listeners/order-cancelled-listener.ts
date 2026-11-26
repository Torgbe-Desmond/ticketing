import { Listener, OrderCancelledEvent, Subjects } from "@tickets/common";
import { JsMsg } from "@nats-io/jetstream";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  durableName: string= "ticket-service";
  streamName: string = "ORDER";

  async onMessage(data:OrderCancelledEvent["data"], msg: JsMsg){
     const ticket = await Ticket.findById(data.ticket.id)

     if(!ticket) throw new Error("Ticket not found")

     ticket.set({ orderId: undefined })

     await ticket.save()

    //  @ts-ignore
     await new TicketUpdatedPublisher(this.nc, this.jsm).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId:  ticket.orderId,
            version: ticket.version,
     });

     msg.ack()

  }
}