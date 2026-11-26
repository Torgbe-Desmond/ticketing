import { JsMsg } from "@nats-io/jetstream";
import { Listener, OrderCreatedEvent, Subjects } from "@tickets/common";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    durableName: string = "payment-service"
    streamName: string = "ORDER"

    async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg){
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        })
        await order.save()

        msg.ack()
    }
}