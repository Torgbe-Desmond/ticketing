import { PaymentCreatedEvent, Publisher, Subjects } from "@tickets/common";

export class PaymemtCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
    streamName: string = "PAYMENT"
}