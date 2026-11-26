import { Listener, Subjects, TicketCreatedEvent } from "@tickets/common";
import { Ticket } from "../../../models/tickets";
import { JsMsg } from "@nats-io/jetstream";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    subject: TicketCreatedEvent["subject"] = Subjects.TicketCreated
    durableName:string = "order-service"
    streamName: string = "TICKET"

    async onMessage(data: TicketCreatedEvent["data"], msg: JsMsg) {
        const { id, title , price } = data
        const ticket = Ticket.build({
           id,title,price
        })
        await ticket.save()
        msg.ack()
    }
}