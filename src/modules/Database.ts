import { createConnection, getConnection } from "typeorm";
import { Video } from "../entity/Video";
import { getLogger } from "../utils/Logging";
import * as util from "util";

export default class Database {
  private logger = getLogger();
  constructor(readonly connectionName: string) {}

  async start(): Promise<void> {
    await createConnection(this.connectionName);
    this.logger.info(
      `Started connection with connection name ${this.connectionName}`
    );
  }

  async stop(): Promise<void> {
    await getConnection(this.connectionName).close();
    this.logger.info(
      `Stopped connection with connection name ${this.connectionName}`
    );
  }

  async writeVideoResult(video: Video): Promise<Video> {
    const result = await getConnection(this.connectionName).manager.save(video);
    this.logger.info(
      `Video entry has been saved in the database. Video is ${util.inspect(
        video
      )}`
    );
    return result;
  }

  async updateVideoResult(id: string, storageUri: string): Promise<Video> {
    const connectionManager = getConnection(this.connectionName).manager;
    const video = await connectionManager.findOne(Video, id);
    if (!video) {
      // TODO: Refactor errors...
      throw new Error("Video not found in database");
    }
    video.storage_uri = storageUri;
    await connectionManager.save(video);
    this.logger.info(`Video has been updated. Video is ${util.inspect(video)}`);
    return video;
  }
  async getVideosForUser(userId: string): Promise<Video[] | undefined> {
    const connectionManager = getConnection(this.connectionName).manager;
    const result = await connectionManager.find(Video, { user_id: userId });
    return result;
  }
}
