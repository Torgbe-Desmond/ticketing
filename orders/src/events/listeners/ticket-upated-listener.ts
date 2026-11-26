import { Listener, Subjects, TicketUpdatedEvent } from "@tickets/common";
import { Ticket } from "../../../models/tickets";
import { JsMsg } from "@nats-io/jetstream";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
    durableName:string = "order-service"
    streamName: string = "TICKET"

   async onMessage(data: TicketUpdatedEvent["data"], msg: JsMsg) {
      const ticket = await Ticket.findByEvent(data)

      if (!ticket) {
    //   const current = await Ticket.findById(data.id);    

    //   // Already applied (a redelivery): acknowledge and move on
    //   if (current && current.version >= data.version) {
    //     msg.ack();
    //     return;
    //   }      

      // Missing or an earlier version is still pending: let JetStream retry later
      throw new Error("Ticket not found");
     }
        const { title, price } = data
        ticket.set({ title, price })
        await ticket.save()
        msg.ack()
    }
}