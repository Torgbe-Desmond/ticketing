import { OrderCreatedEvent, OrderStatus } from "@tickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { JsMsg } from "@nats-io/jetstream";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

async function setup(){
  const listener = new OrderCreatedListener(natsWrapper.nc,natsWrapper.jsm)

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "2333422",
    userId: " dfasdfasd",
    status: OrderStatus.Created,
    ticket: {
        id: "23334433",
        price: 10
    }
  }

  // @ts-ignore
  const msg:JsMsg = {
    ack: jest.fn()
  }

  return { listener, msg, data }
}

it("replicates the order info", async ()=>{
    const { listener, data , msg } = await setup()
    await listener.onMessage(data, msg)

    const order = await Order.findById(data.id)
    expect(order!.price).toEqual(data.ticket.price)
})

it("replicates the order info", async ()=>{
    const { listener, data , msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})