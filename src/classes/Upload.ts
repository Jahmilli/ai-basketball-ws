import config from "config";
import * as stream from "stream";
import * as util from "util";
import { getLogger, formatError } from "../utils/Logging";
import S3Helper from "./S3Helper";
import { S3 } from "aws-sdk";

namespace Upload {
  const logger = getLogger();
  const s3Bucket: string = config.get("s3.recordingsBucket");

  export const uploadFileToS3 = (s3: S3, managedUpload: any) => {
    managedUpload.promise().then(async (data: any) => {
      const uri = `s3://${data.Bucket}/${data.Key}`;
      let recordingDuration = 0;
      try {
        const headResult = await s3.headObject(data.Bucket, data.Key);
        logger.info(`HeadResult is ${util.inspect(headResult)}`);
      } catch (err) {
        logger.warn(
          `An error occurred when getting object result in S3 ${formatError(
            err
          )}`
        );
        return;
      }
    });
  };
}

export default Upload;
