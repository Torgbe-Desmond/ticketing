import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY must be defined");
    }
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be defined");
    }
    if(!process.env.NATS_URL){
        throw new Error("MONGO_URI must be defined");
    }
    
    console.log("Connecting to MongoDB...");

    await natsWrapper.connect(process.env.NATS_URL);

    const onListenerError = (err: unknown) => {
      console.error("Listener failed:", err);
      process.exit(1);
    };

       const shutdown = async () => {
      await natsWrapper.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    new OrderCancelledListener(natsWrapper.nc, natsWrapper.jsm).listen()
    new OrderCreatedListener(natsWrapper.nc, natsWrapper.jsm).listen() 

    console.log("Logging from tickets")
    console.log("Connecteds to mongodb");
    app.listen(3000, () => {
      console.log("App is running on port:3000");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();
