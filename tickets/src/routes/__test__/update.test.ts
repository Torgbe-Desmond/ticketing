import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { mockPublish } from "../../test/setup";
import { Subjects } from "@tickets/common";
import { Ticket } from "../../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({ title: "Love", price: 20 })
    .expect(404);
});


it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Love good fuck",
      price: 50,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "Love good food", price: 30 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signin())
    .send({
      title: "Love good fuck",
      price: 50,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = signin();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "", price: 30 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Love good food", price: -30 })
    .expect(400);
});

it("updates the ticket provided the valid inputs", async () => {
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Love good food", price: 30 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Love good food 2", price: 630 })
    .expect(200);
});


it("publishes a ticket updated event", async () => {
  const cookie = signin();
  const title = "Love good food";
  const price0 = 30;
  const price1 = 360;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title, price: price0 })
    .expect(201);

  mockPublish.mockClear(); 

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title, price: price1 })
    .expect(200);

  expect(mockPublish).toHaveBeenCalledTimes(1);

  const [subject, payload] = mockPublish.mock.calls[0];
  expect(subject).toEqual(Subjects.TicketUpdated);

  const data = JSON.parse(payload);
  expect(data.id).toEqual(response.body.id);
  expect(data.title).toEqual(title);
  expect(data.price).toEqual(price1);
});

it("rejects updated if the ticket is reserved", async ()=>{
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "concert", price: 43 })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  mockPublish.mockClear(); 

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "concert", price: 30 })
    .expect(400);
})