import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../../models/tickets";
import { OrderStatus, Subjects } from "@tickets/common";
import { Order } from "../../../models/orders";
import { mockPublish } from "../../test/setup";

it("returns an error if the ticket does not exist", async () => {
   const ticketId = new mongoose.Types.ObjectId()

   return request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId })
    .expect(404);

});

it("returns an error if the ticket is already reserved", async () => {
    const ticket = Ticket.build({
        title:"concert",
        price:30,
        id: new mongoose.Types.ObjectId().toHexString()
    })

    await ticket.save()

    const order = Order.build({
        ticket,
        userId:"12233dsdafa",
        status:OrderStatus.Created,
        expiresAt: new Date(),
    })

    await order.save()

    await request(app)
        .post("/api/orders")
        .set("Cookie", signin())
        .send({ticketId:ticket.id})
        .expect(400)
});

it("reserves a ticket", async () => {
      const ticket = Ticket.build({
        title:"concert",
        price:30,
        id: new mongoose.Types.ObjectId().toHexString()
    })

    await ticket.save()

    await request(app)
        .post("/api/orders")
        .set("Cookie", signin())
        .send({ ticketId:ticket.id })
        .expect(201)

});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 30,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(mockPublish).toHaveBeenCalledTimes(1);

  const [subject, payload] = mockPublish.mock.calls[0];
  expect(subject).toEqual(Subjects.OrderCreated);

  const data = JSON.parse(payload);
  expect(data.id).toEqual(order.id);
  expect(data.ticket.id).toEqual(ticket.id);
  expect(data.ticket.price).toEqual(30);
});