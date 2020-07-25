import AWS from "aws-sdk";
import stream from "stream";
import { IS3Config } from "IConfig";

export default class S3Helper {
  public readonly s3: AWS.S3;

  constructor(s3Config: IS3Config) {
    AWS.config.update(s3Config);
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
}
