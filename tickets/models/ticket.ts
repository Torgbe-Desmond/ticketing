import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttr {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  userId: string;
  title: string;
  price: number;
  version: number;
  orderId?: string
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build: (ticket: TicketAttr) => TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId:{
      type:String
    }
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  },
);

ticketSchema.set("versionKey", "version")
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = function(attrs:TicketAttr){
  return new Ticket(attrs)
}

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
  "Ticket",
  ticketSchema,
);
