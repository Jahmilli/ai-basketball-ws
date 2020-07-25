import { getLogger } from "./utils/Logging";
import { Express } from "express";
import { setupExpress } from "./modules/Express";
import HttpServer from "./modules/HttpServer";
import Database from "./modules/Database";

export default class App {
  readonly logger = getLogger();
  readonly server: HttpServer;
  private ex: Express;
  private db = new Database("video-connection");

  /**
   * Only add static code to constructor to make unit testing possible.
   */
  constructor() {
    this.ex = setupExpress();
    this.server = new HttpServer(this.ex);
  }

  async start(): Promise<void> {
    this.logger.info("Starting up...");
    await this.db.start();
    await this.server.start();
    this.logger.info("Started HTTP Server");
  }

  async stop(): Promise<void> {
    await this.server.stop();
    await this.db.stop();
  }
}
