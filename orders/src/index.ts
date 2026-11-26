import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-upated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";


const start = async () => {
  try {
    console.log("starting")
    if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined");
    if (!process.env.NATS_URL) throw new Error("NATS_URL must be defined");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    await natsWrapper.connect(process.env.NATS_URL);

    const shutdown = async () => {
      await natsWrapper.close();
      await mongoose.connection.close();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    const onListenerError = (err: unknown) => {
      console.error("Listener failed:", err);
      process.exit(1);
    };

    // Not awaited: listen() runs for the life of the process
    new TicketCreatedListener(natsWrapper.nc, natsWrapper.jsm).listen().catch(onListenerError);
    new TicketUpdatedListener(natsWrapper.nc, natsWrapper.jsm).listen().catch(onListenerError);
    new ExpirationCompleteListener(natsWrapper.nc, natsWrapper.jsm).listen().catch(onListenerError)
    new PaymentCreatedListener(natsWrapper.nc, natsWrapper.jsm).listen().catch(onListenerError)

    app.listen(3000, () => console.log("App is running on port:3000"));
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

start()