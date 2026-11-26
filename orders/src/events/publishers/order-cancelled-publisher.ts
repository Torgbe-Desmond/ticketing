import { OrderCancelledEvent, Publisher, Subjects } from "@tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    streamName = "ORDER";
}