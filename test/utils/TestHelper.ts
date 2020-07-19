import { createConnection, getConnection } from "typeorm";
import { promisify } from "util";
import { S3 } from "aws-sdk";
import { Video } from "../../src/entity/Video";
import { getLogger } from "../../src/utils/Logging";

const logger = getLogger();
export const waitAsync = (timeout: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

export const getTestRequest = () => {
  // TODO: Figure out what actual request will have to be...
  return {
    userId: "12345",
    name: "Temporary video name",
    description: "This is a temporary description",
    angleOfShot: "side-on",
    typeOfShot: "free-throw",
    uploadedTimestamp: new Date("2020-07-19T02:45:32.722Z"),
  };
};

export const getExpectedDbResult = () => {
  return {
    user_id: "12345",
    name: "Temporary video name",
    description: "This is a temporary description",
    is_processed: false,
    angle_of_shot: "side-on",
    type_of_shot: "free-throw",
    storage_uri: "",
    feedback: "",
    uploaded_timestamp: "2020-07-19T02:45:32.722Z",
    id: expect.any(String),
  };
};

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
    await Promise.all(
      objects.Contents.map(async ({ Key }: any) => {
        return await deleteS3Object(Bucket, Key, s3);
      })
    );
  };
}

export class DatabaseTestHelper {
  constructor(readonly connectionName: string) {}

  async start() {
    await createConnection({
      name: this.connectionName,
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "mysecretpassword",
      database: "mydb",
      entities: ["src/entity/**/*.ts"],
      migrations: ["src/migration/**/*.ts"],
      subscribers: ["src/subscriber/**/*.ts"],
    });
    logger.info(
      `Started connection with connection name ${this.connectionName}`
    );
  }
  async stop() {
    await getConnection(this.connectionName).close();
    logger.info(
      `Closed test connection with connection name ${this.connectionName}`
    );
  }
  // TODO: Parameterise functions so doesn't only work for Video
  getVideoRows = async () => {
    return getConnection(this.connectionName).manager.find(Video);
  };

  deleteAllVideoRows = async () => {
    await getConnection(this.connectionName)
      .createQueryBuilder()
      .delete()
      .from(Video)
      .execute();
  };
}
