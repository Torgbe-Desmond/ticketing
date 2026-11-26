import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  try {
    if(!process.env.NATS_URL){
        throw new Error("MONGO_URI must be defined");
    }
    
    console.log("Connecting to MongoDB...");

    await natsWrapper.connect(process.env.NATS_URL);

    new OrderCreatedListener(natsWrapper.nc, natsWrapper.jsm).listen()
    
    const shutdown = async () => {
      await natsWrapper.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();
