import {
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  validateRequest,
  BadRequestError,
} from "@tickets/common";
import express, { Request, Response } from "express";
import { Ticket } from "../../models/ticket";
import { body } from "express-validator";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

const ticketValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
];

router.put(
  "/api/tickets/:id",
  requireAuth,
  ticketValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new NotFoundError();

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if(ticket.orderId){
      throw new BadRequestError("Cannot edit a reserved a ticket")
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    const publisher = new TicketUpdatedPublisher(
          natsWrapper.nc,
          natsWrapper.jsm,
        );

     publisher.publish({
          id: ticket.id,
          title: ticket.title,
          price: ticket.price,
          userId: ticket.userId,
          version: ticket.version
    });

    res.send(ticket);
  },
);

export { router as updateTicketRouter };
