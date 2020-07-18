
import { promisify } from "util";
import { S3 } from "aws-sdk";

export const waitAsync = (timeout: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

export const getTestRequest = () => {
  // Figure out what request is...
  return {
    message: "hi"
  }
}

export namespace s3TestHelper {
  export const deleteS3Object = async (Bucket: string, Key: string, s3: S3) => {
    const s3DeleteObject: any = promisify(s3.deleteObject.bind(s3));
    return s3DeleteObject({ Bucket, Key });
  };

  export const deleteS3Bucket = async (Bucket: string, s3: S3) => {
    const s3DeleteBucket: any = promisify(s3.deleteBucket.bind(s3));
    return s3DeleteBucket({ Bucket });
  };

  export const createS3Bucket = async (Bucket: string, s3: S3) => {
    const s3CreateBucket: any = promisify(s3.createBucket.bind(s3));
    return s3CreateBucket({ Bucket });
  };

  export const listObjects = async (Bucket: string, s3: S3) => {
    const s3ListObjects: any = promisify(s3.listObjectsV2.bind(s3));
    return s3ListObjects({ Bucket });
  };

  export const clearBucket = async (Bucket: string, s3: S3) => {
    const objects = await listObjects(Bucket, s3);
    await Promise.all(objects.Contents.map(async ({ Key }: any) => {
      return await deleteS3Object(Bucket, Key, s3);
    }));
  };
}
