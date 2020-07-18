import { createConnection } from "typeorm";
import { Video } from "../entity/Video";
import { getLogger, formatError } from "../utils/Logging";
import * as util from "util";

export default class Database {
  private logger = getLogger();
  constructor() {}

  setup() {}

  async start() {}

  async stop() {}

  async writeVideoResult(video: Video) {
    try {
      const connection = await createConnection();
      await connection.manager.save(video);
      this.logger.info(`Video has been saved. Video is ${util.inspect(video)}`);
    } catch (err) {
      this.logger.warn(
        `An error occurred when writing video ${JSON.stringify(
          video
        )} to database ${formatError(err)}`
      );
    }
  }
}
