import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting server")
  try {
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY must be defined");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be defined");
    }
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to mongodb");
    app.listen(3000, () => {
      console.log("App is running on port:3000");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();
