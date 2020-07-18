import * as stream from "stream";
import * as util from "util";
import { getLogger, formatError } from "../utils/Logging";

namespace Upload {
  const logger = getLogger();

  export const uploadFileToS3 = (s3: any, managedUpload: any) => {
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
