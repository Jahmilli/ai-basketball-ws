import { getLogger } from "./utils/Logging";
import { Express } from "express";
import { setupExpress } from "./classes/express";
import HttpServer from "./classes/HttpServer";
import Database from "./classes/Database";

export default class App {
  readonly logger = getLogger();
  readonly server: HttpServer;
  private ex: Express;
  private db: Database;

  /**
   * Only add static code to constructor to make unit testing possible.
   */
  constructor() {
    this.ex = setupExpress();
    this.server = new HttpServer(this.ex);
    this.db = new Database();
  }

  async start() {
    this.logger.info("Starting up...");
    await this.server.start();
    this.logger.info("Started HTTP Server");
  }

  async stop() {
    await this.server.stop();
  }
}
