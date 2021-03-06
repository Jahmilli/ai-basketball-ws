import { getLogger, formatError } from "../utils/Logging";
import got from "got";
import { IPoseServiceConfig } from "IConfig";

export default class PoseService {
  private logger = getLogger();
  constructor(readonly poseServiceConfig: IPoseServiceConfig) {}

  async sendRequest(id: string, videoUri: string): Promise<void> {
    this.logger.debug(`Sending video uri ${videoUri}`);
    const { endpoint, path, timeout } = this.poseServiceConfig;
    try {
      const result = await got(`${endpoint}${path}`, {
        method: "POST",
        https: {
          rejectUnauthorized: false,
        },
        retry: 0, // Must be set to 0 or got() will retry after requestTimeout
        timeout: timeout,
        json: {
          id,
          videoUri,
        },
      });
      this.logger.debug(
        `Message successfully delivered with retry count: ${result.retryCount}, total time: ${result.timings.phases.total}ms`
      );
    } catch (err) {
      this.logger.warn(
        `An error occurred when sending request to pose service ${formatError(
          err
        )}`
      );
      throw err;
    }
  }
}
