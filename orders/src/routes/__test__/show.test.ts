import request from "supertest"
import {app} from "../../app"
import { Ticket } from "../../../models/tickets"
import mongoose from "mongoose"

it("fetches the order", async ()=>{
    // Create a ticket
    const ticket = Ticket.build({
        title:"concert",
        price:20,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()
    const cookie = signin()

    const { body: order } = await request(app)
         .post("/api/orders")
         .set("Cookie", cookie)
         .send({ ticketId: ticket.id })
         .expect(201)

    const { body: fetchedOrder } = await request(app)
         .get(`/api/orders/${order.id}`)
         .set("Cookie", cookie)
         .send()
         .expect(200)

     expect(fetchedOrder.id).toEqual(order.id)
})


it("it returns and error if one user tries to fetch another users order", async ()=>{
    // Create a ticket
    const ticket = Ticket.build({
        title:"concert",
        price:20,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()
    const userOne = signin()
    const userTwo = signin()

    const { body: order } = await request(app)
         .post("/api/orders")
         .set("Cookie", userOne)
         .send({ ticketId: ticket.id })
         .expect(201)

    await request(app)
         .get(`/api/orders/${order.id}`)
         .set("Cookie", userTwo)
         .send()
         .expect(401)

})


