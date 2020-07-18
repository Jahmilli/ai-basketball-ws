const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet,
  };
});

import Server from "../../src/Server";
import {
  s3TestHelper,
  waitAsync,
  DatabaseTestHelper,
} from "../utils/TestHelper";
import { getLogger, formatError } from "../../src/utils/Logging";
import request from "supertest";
import fastify from "fastify";
import FormData from "form-data";
import fs from "fs";
import * as path from "path";
import S3Helper from "../../src/classes/S3Helper";
import config from "config";
import { Video } from "../../src/entity/Video";

const logger = getLogger();
const httpsServer = fastify();

mockConfigGet.mockImplementation((key: string) => {
  switch (key) {
    case "s3": {
      return {
        videosBucket,
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
        endpoint: "127.0.0.1:9000",
        sslEnabled: false,
        s3ForcePathStyle: true,
      };
    }
    default:
      // Return actual value for all but above
      return jest.requireActual("config").get(key);
  }
});

const mockRecognitionServer = jest.fn();
// let responseDelayMs = 0;
// Setup routes for the next ws we call...
httpsServer.post("/routine/create", {}, async (request: any, reply: any) => {
  logger.debug(
    `Received request in test server with body ${JSON.stringify(request.body)}`
  );
  // await waitAsync(responseDelayMs);
  await waitAsync(100);
  reply
    .code(
      mockRecognitionServer({
        message: "Success",
      })
    )
    .send();
});

const videosBucket = "test-bucket";

describe("End-2-End test", () => {
  const serverUrl = "http://localhost:4993";
  let server: Server;
  let address: string;
  let s3 = new S3Helper(config.get("s3"));
  const dbTestHelper = new DatabaseTestHelper("test-connection");

  beforeAll(async () => {
    address = await httpsServer.listen(0);
    // await s3TestHelper.createS3Bucket(videosBucket, s3.getS3());
    // console.log("Created bucket", videosBucket);
    await dbTestHelper.start();
  });

  afterAll(async () => {
    await httpsServer.close();
    // await s3TestHelper.deleteS3Bucket(videosBucket, s3.getS3());
    await dbTestHelper.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    server = new Server();
    await dbTestHelper.deleteAllVideoRows();
    await server.start();
    await waitAsync(2000);
  }, 10000);

  afterEach(async () => {
    await server.stop();
    await s3TestHelper.clearBucket(videosBucket, s3.getS3());
  });

  describe("Upload Video", () => {
    it("Should upload a video, save it to S3, save it to Postgres and send result to Pose Detection Server", async () => {
      let s3Result: any = await s3TestHelper.listObjects(
        videosBucket,
        s3.getS3()
      );
      expect(s3Result.Contents.length).toEqual(0);
      let dbResult = await dbTestHelper.getVideoRows();
      expect(dbResult.length).toEqual(0);
      await waitAsync(4000);
      const formData = new FormData();
      formData.append(
        "myFile",
        fs.createReadStream(
          path.join(__dirname, "..", "fixtures", "test-video.MOV")
        )
      );

      await new Promise((resolve, reject) => {
        // TODO: Await on response from server here and assert on it...
        formData.submit(`${serverUrl}/api/v1/video/stream`, (err, res) => {
          if (err) {
            logger.warn(
              `An error occurred when submitting test video ${formatError(err)}`
            );
            reject("An error occurred when submitting test video");
          }
          res.resume();
          resolve();
        });
      });
      expect(true);
      s3Result = await s3TestHelper.listObjects(videosBucket, s3.getS3());
      expect(s3Result.Contents.length).toEqual(1);
      dbResult = await dbTestHelper.getVideoRows();
      expect(dbResult.length).toEqual(1);
    }, 15000);
  });
});
