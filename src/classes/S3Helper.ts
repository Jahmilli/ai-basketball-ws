import AWS from "aws-sdk";
import config from "config";
import stream from "stream";
import util from "util";
import { formatError, getLogger } from "../utils/Logging";

export default class S3Helper {
  private s3: AWS.S3;
  private readonly logger = getLogger();

  constructor(s3config: any) {
    // const s3Conf: any = config.get("s3");
    const s3Conf: any = {
      videosBucket: "test-bucket",
      accessKeyId: "minioadmin",
      secretAccessKey: "minioadmin",
      endpoint: "127.0.0.1:9000",
      sslEnabled: false,
      s3ForcePathStyle: true,
    };
    console.log("s3 config is ", s3Conf);
    AWS.config.update(s3Conf);
    this.s3 = new AWS.S3();
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

  async deleteObject(Bucket: string, Key: string) {
    try {
      const del: any = util.promisify(this.s3.deleteObject.bind(this.s3));
      await del({ Bucket, Key });
      this.logger.debug(
        `Successfully deleted object with key ${Key} from bucket ${Bucket}`
      );
    } catch (err) {
      this.logger.warn(
        `An error occurred when deleting recording with key ${Key} from bucket ${Bucket}: ${formatError(
          err
        )}`
      );
    }
  }

  async headObject(Bucket: string, Key: string) {
    try {
      const head: any = util.promisify(this.s3.headObject.bind(this.s3));
      const result = await head({
        Bucket,
        Key,
      });
      return result;
    } catch (err) {
      this.logger.warn(
        `An error occurred when getting head object with key ${Key} from bucket ${Bucket}: ${formatError(
          err
        )}`
      );
      throw err;
    }
  }
  getS3() {
    return this.s3;
  }
}
