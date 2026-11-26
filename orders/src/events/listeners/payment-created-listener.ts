import { Listener, OrderStatus, PaymentCreatedEvent, Subjects, TicketCreatedEvent } from "@tickets/common";
import { JsMsg } from "@nats-io/jetstream";
import { Order } from "../../../models/orders";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
    durableName:string = "order-service"
    streamName: string = "PAYMENT"

    async onMessage(data: PaymentCreatedEvent["data"], msg: JsMsg) {
        const order = await Order.findById(data.orderId)

        if(!order){
            throw new Error("Order not found")
        }

        order.set({
            status: OrderStatus.Complete
        })

        await order.save()

        msg.ack()
    }
}