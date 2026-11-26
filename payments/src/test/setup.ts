import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?:string) => string[];
}

export const mockPublish = jest.fn();

jest.mock("../nats-wrapper");

jest.mock("@nats-io/jetstream", () => ({
  ...jest.requireActual("@nats-io/jetstream"),
  jetstream: jest.fn(() => ({ publish: mockPublish })),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockPublish.mockImplementation(async () => ({ stream: "test", seq: 1 }));
});

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "12345";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?:string) => {
  const payload = {
    id: id ? id : new mongoose.Types.ObjectId().toHexString(),
    email: "123torgbe@gmail.com",
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`session=${base64}`];
};
