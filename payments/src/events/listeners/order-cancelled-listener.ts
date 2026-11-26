import { JsMsg } from "@nats-io/jetstream";
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@tickets/common";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    durableName: string = "payment-service"
    streamName: string = "ORDER"

    async onMessage(data: OrderCancelledEvent["data"], msg: JsMsg){
        const order =  await Order.findOne({ _id: data.id, version: data.version -1 })

        if(!order){
            throw new Error("Order not found")
        }

        order.set({ status: OrderStatus.Cancelled })
        await order.save()

        msg.ack()
    }
}