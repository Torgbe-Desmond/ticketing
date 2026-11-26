import { connect } from "@nats-io/transport-node";
import type { NatsConnection } from "@nats-io/nats-core";
import { jetstreamManager, type JetStreamManager } from "@nats-io/jetstream";

class NatsWrapper {
  private _nc?: NatsConnection;
  private _jsm?: JetStreamManager;

  async connect(url: string) {
    console.log("Connecting to NATS server");
    this._nc = await connect({ servers: url });
    console.log("Connected to NATS server");

    this._jsm = await jetstreamManager(this._nc);
    console.log("Initialized JetStream manager");

    // Log if the connection ever closes, and why
    this._nc.closed().then((err) => {
      if (err) {
        console.error("NATS connection closed with error:", err);
      } else {
        console .log("NATS connection closed");
      }
    });
  }

  async close() {
    if (this._nc && !this._nc.isClosed()) {
      await this._nc.drain();
    }
  }

  get jsm() {
    if (!this._jsm) {
      throw new Error("JetStream manager is not initialized");
    }
    return this._jsm;
  }

  get nc() {
    if (!this._nc) {
      throw new Error("NATS connection is not initialized");
    }
    return this._nc;
  }
}

export const natsWrapper = new NatsWrapper();
