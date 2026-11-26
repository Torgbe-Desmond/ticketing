import { Subjects } from "@tickets/common";

interface Event {
  subject: Subjects;
  data: any;  
}

export const natsWrapper = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),

  jsm: {
    streams: {
      info: jest.fn().mockImplementation(async () => ({
        config: { subjects: [] },
      })),
      add: jest.fn().mockImplementation(async () => ({})),
      update: jest.fn().mockImplementation(async () => ({})),
    },
    consumers: {
      add: jest.fn().mockImplementation(async () => ({})),
    },
  },

  nc: {},
};