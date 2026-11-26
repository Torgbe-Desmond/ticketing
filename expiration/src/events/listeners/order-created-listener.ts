import { Listener, OrderCreatedEvent, Subjects } from "@tickets/common";
import { JsMsg } from "@nats-io/jetstream";
import { expirationQueue } from "../../queues/expirtion-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    // which messages inside that stream I want (filter_subject)
    subject: Subjects.OrderCreated= Subjects.OrderCreated
    // my bookmark: who I am (service) and how far I've read
    durableName:string = "expiration-service"
    // which stream (storage container) to read from
    streamName: string = "ORDER"

    async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg){
          const delay = new Date(data.expiresAt).getTime() - new Date().getTime()

          await expirationQueue.add({
          orderId: data.id
          },
          {
              delay,
          }
        )
        msg.ack()
    }
}

