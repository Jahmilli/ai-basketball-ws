import { getLogger, formatError } from "../utils/Logging";
import { S3 } from "aws-sdk";

namespace Upload {
  const logger = getLogger();

  export const uploadFileToS3 = async (s3: S3, managedUpload: any) => {
    try {
      const data = await managedUpload.promise();
      const uri = `s3://${data.Bucket}/${data.Key}`;
      logger.info(`URI of uploaded video is ${uri}`);
      return uri;
    } catch (err) {
      logger.warn(
        `An error occurred when getting object result in S3 ${formatError(err)}`
      );
      throw err;
    }
  };
}

export default Upload;
