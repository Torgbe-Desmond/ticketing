import mongoose from "mongoose";
import { Order } from "../../../../models/orders";
import { Ticket } from "../../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { ExpirationCompleteEvent, OrderStatus, Subjects } from "@tickets/common";
import { mockPublish } from "../../../test/setup";

async function setup(){
    const listener = new ExpirationCompleteListener(natsWrapper.nc, natsWrapper.jsm)

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 300
    })
    await ticket.save()

    const order = Order.build({
        status: OrderStatus.Created,
        userId: '23443',
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg }
}

it("updates the order status to cancelled", async ()=>{
    const { listener, order , ticket, data, msg } = await setup();
    const updatedOrder = await Order.findById(order.id)
    updatedOrder!.set({ status: OrderStatus.Cancelled })
    await updatedOrder!.save()
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it("emit an OrderCancelled event", async ()=>{
    const { listener, order , ticket, data, msg } = await setup();

    await listener.onMessage(data, msg)

    expect(mockPublish).toHaveBeenCalledTimes(1);
    
    const [subject, payload] = mockPublish.mock.calls[0];
    expect(subject).toEqual(Subjects.OrderCancelled);

    const eventData = JSON.parse(payload);
    expect(eventData.id).toEqual(order.id);

})

it("ack the message", async ()=>{
    const { listener, order , ticket, data, msg } = await setup();
    await listener.onMessage(data,msg)
    expect(msg.ack).toHaveBeenCalled()
})