import { getLogger, formatError } from "../utils/Logging";
import { S3 } from "aws-sdk";

export default class Upload {
  private logger = getLogger();

  uploadFileToS3 = async (managedUpload: S3.ManagedUpload): Promise<string> => {
    try {
      const data = await managedUpload.promise();
      const uri = `s3://${data.Bucket}/${data.Key}`;
      this.logger.info(`URI of uploaded video is ${uri}`);
      return uri;
    } catch (err) {
      this.logger.warn(
        `An error occurred when getting object result in S3 ${formatError(err)}`
      );
      throw err;
    }
  };
}
