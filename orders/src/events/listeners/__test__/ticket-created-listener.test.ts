import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@tickets/common";
import mongoose from "mongoose";
import { JsMsg } from "@nats-io/jetstream";
import { Ticket } from "../../../../models/tickets";

function setup() {
  const listener = new TicketCreatedListener(natsWrapper.nc, natsWrapper.jsm);

  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg = { ack: jest.fn() } as unknown as JsMsg;

  return { listener, data, msg };
}

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);
  expect(ticket).not.toBeNull();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});