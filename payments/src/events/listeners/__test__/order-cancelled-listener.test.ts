import mongoose from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@tickets/common";
import { JsMsg } from "@nats-io/jetstream";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

async function setup(){
    const listener = new OrderCancelledListener(natsWrapper.nc, natsWrapper.jsm)
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: '12324234234',
        version: 0    
    })

    await order.save()

      const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: 1,
        ticket: {
            id: "23334433",
        }
      }

    // @ts-ignore
    const msg:JsMsg = {
        ack: jest.fn()
    }

    return { listener, data, msg, order}
    
}

it("updates the status of the order", async () => {
    const  { listener, data, msg, order } = await setup()
    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it("updates the status of the order", async () => {
    const  { listener, data, msg, order} = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})