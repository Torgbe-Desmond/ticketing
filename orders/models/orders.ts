import { OrderStatus } from "@tickets/common";
import mongoose from "mongoose";
import { TicketDoc } from "./tickets";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrdersAttr {
  userId:string;
  status: OrderStatus;
  expiresAt:Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId:string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface OrdersModel extends mongoose.Model<OrderDoc> {
  build:(data:OrdersAttr)=> OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date
    },
    ticket:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Ticket"
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


orderSchema.set("versionKey","version")
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = function(attrs:OrdersAttr){
  return new Order(attrs)
}

export const Order = mongoose.model<OrderDoc, OrdersModel>(
  "Order",
  orderSchema,
);

