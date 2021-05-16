import AWS from "aws-sdk";
import { IS3Config } from "IConfig";
import stream from "stream";
import { promisify } from "util";
import { getLogger } from "../utils/Logging";

export default class S3Helper {
  public readonly s3: AWS.S3;
  private logger = getLogger();

  constructor(s3Config: IS3Config) {
    AWS.config.update(s3Config);
    this.s3 = new AWS.S3();
    this.logger.info(`S3 Helper initialised...`);

    // Just to make life easier for dev...
    // if (process.env.NODE_ENV === "dev") {
    //   (async () => {
    //     try {
    //       await this.createBucket(s3Config.videosBucket);
    //       this.logger.info(`Created bucket ${s3Config.videosBucket}`);
    //     } catch (err) {
    //       this.logger.warn(
    //         `An error occurred when creating bucket ${formatError(err)}`
    //       );
    //       // Assume that the bucket exists already and continue...
    //     }
    //   })();
    // }
  }

  /**
   * Expects to be piped from a readstream to then create a write stream to S3.
   * @param { type } string bucket name
   * @param { type } string key name
   */
  upload(
    Bucket: string,
    Key: string
  ): { writeStream: stream.PassThrough; managedUpload: AWS.S3.ManagedUpload } {
    const pass = new stream.PassThrough();
    return {
      writeStream: pass,
      managedUpload: this.s3.upload({ Bucket, Key, Body: pass }),
    };
  }

  async createBucket(Bucket: string) {
    const s3CreateBucket: any = promisify(this.s3.createBucket.bind(this.s3));
    return s3CreateBucket({ Bucket });
  }
}
