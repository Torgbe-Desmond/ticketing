import request from "supertest";
import { app } from "../../app";
import { mockPublish } from "../../test/setup";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "",
      price: 30,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      price: 30,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "rwwerwer",
      price: -30,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "rwwerwer",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "Love",
      price: 30,
    })
    .expect(201);
});

it("publishes ticket.created", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "Love", price: 30 })
    .expect(201);

    // const publisher = new TicketCreatedPublisher(natsWrapper.nc, natsWrapper.jsm)

    // expect(publisher.publish).toHaveBeenCalled()

  expect(mockPublish).toHaveBeenCalledTimes(1);
  const [subject, payload] = mockPublish.mock.calls[0];
  expect(subject).toEqual("ticket.created");
  expect(JSON.parse(payload).title).toEqual("Love");
});

it("fails when the event can't be published", async () => {
  mockPublish.mockImplementationOnce(async () => {
    throw new Error("NATS unavailable");
  });

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "Love", price: 30 });

  expect(res.status).toEqual(400);
});