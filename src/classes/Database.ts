import { createConnection, getConnection } from "typeorm";
import { Video } from "../entity/Video";
import { getLogger } from "../utils/Logging";
import * as util from "util";

export default class Database {
  private logger = getLogger();
  constructor(readonly connectionName: string) {}

  setup() {}

  async start() {
    this.logger.info(
      `Starting connection with connection name ${this.connectionName}`
    );
    await createConnection(this.connectionName);
    this.logger.info(
      `Started connection with connection name ${this.connectionName}`
    );
  }

  async stop() {
    this.logger.info(
      `Stopping connection with connection name ${this.connectionName}`
    );
    await getConnection(this.connectionName).close();
    this.logger.info(
      `Stopped connection with connection name ${this.connectionName}`
    );
  }

  async writeVideoResult(video: Video) {
    this.logger.info(`Writing video to database`);
    const result = await getConnection(this.connectionName).manager.save(video);
    this.logger.info(`Video has been saved. Video is ${util.inspect(video)}`);
    return result;
  }
}
