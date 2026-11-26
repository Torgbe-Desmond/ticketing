import { ExpirationCompleteEvent, Publisher, Subjects } from "@tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
    streamName: string = "EXPIRATION"
}