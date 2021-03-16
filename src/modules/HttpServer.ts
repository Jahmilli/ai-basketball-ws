import * as util from "util";
import config from "config";
import { Express } from "express";
import * as http from "http";
import { formatError, getLogger } from "../utils/Logging";

class HttpServer {
  private logger = getLogger();
  private server: http.Server;

  constructor(express: Express) {
    this.server = this.setup(express);
  }

  setup(express: Express): http.Server {
    const server = http.createServer(express);
    server.on("error", (err) => {
      this.logger.warn(formatError(err));
    });
    this.logger.info("Setup HTTP Server");
    return server;
  }

  async start(): Promise<void> {
    await util.promisify(this.server.listen).bind(this.server)(
      config.get("api.port")
    );
    const address = this.server.address() as { port: number };
    this.logger.info(`Started HTTP Server on port ${address.port}`);
  }

  async stop(): Promise<void> {
    try {
      await util.promisify(this.server.close).bind(this.server)();
      this.logger.info("Stopped HTTP Server");
    } catch (err) {
      this.logger.warn(
        `Error when trying to stop HTTP Server ${formatError(err)}`
      );
    }
  }
}

export default HttpServer;
