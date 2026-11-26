import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../../models/tickets"
import { OrderStatus, Subjects } from "@tickets/common"
import { Order } from "../../../models/orders"
import { mockPublish } from "../../test/setup"
import mongoose from "mongoose"

it("marks an order as cancelled", async ()=>{
   // create a ticket with Ticket Model
   const ticket = Ticket.build({
        title:"concert",
        price:20,
        id: new mongoose.Types.ObjectId().toHexString()
   })

   await ticket.save()

   const user = signin()

   // make a request to create an order
   const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201)
    
   // make a request to cancel an order
   await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(204)

   // expectation to make sure the order is cancelld
   const updatedOrder = await Order.findById(order.id)
   expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it("emits an order cancelled event", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const user = signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  mockPublish.mockClear(); // forget the "order created" publish

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(mockPublish).toHaveBeenCalledTimes(1);
  const [subject, payload] = mockPublish.mock.calls[0];
  expect(subject).toEqual(Subjects.OrderCancelled);
  expect(JSON.parse(payload).id).toEqual(order.id);
});


