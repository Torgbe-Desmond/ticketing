import { Subjects } from "@tickets/common";

interface Event {
  subject: Subjects;
  data: any;  
}

export const natsWrapper = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),

  // Used by ensureStream() in Publisher.setup() and Listener.setupConsumer()
  jsm: {
    streams: {
      info: jest.fn().mockResolvedValue({ config: { subjects: [] } }),
      add: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
    consumers: {
      add: jest.fn().mockResolvedValue({}),
    },
  },

  // Only passed to Publisher/Listener; real sends go through jetstream(nc)
  nc: {},
};