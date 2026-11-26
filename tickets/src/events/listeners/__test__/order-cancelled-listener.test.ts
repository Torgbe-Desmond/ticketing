import mongoose from "mongoose";
import { Ticket } from "../../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, Subjects } from "@tickets/common";
import { JsMsg } from "@nats-io/jetstream";
import { mockPublish } from "../../../test/setup";

async function setup() {
  const listener = new OrderCancelledListener(natsWrapper.nc, natsWrapper.jsm);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: "1222333",
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: { id: ticket.id },
  };

  const msg = { ack: jest.fn() } as unknown as JsMsg;

  return { listener, ticket, data, msg };
}

it("updates the ticket, publishes an event, and acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toBeUndefined();

  expect(msg.ack).toHaveBeenCalledTimes(1);

  expect(mockPublish).toHaveBeenCalledTimes(1);
  const [subject, payload] = mockPublish.mock.calls[0];
  expect(subject).toEqual(Subjects.TicketUpdated);
  expect(JSON.parse(payload).orderId).toBeUndefined();
});