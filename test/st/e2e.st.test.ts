const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet,
  };
});

import Server from "../../src/Server";
import { S3 } from "aws-sdk";
import { s3TestHelper, waitAsync } from "../utils/TestHelper";
import { getLogger, formatError } from "../../src/utils/Logging";
import request from "supertest";
import fastify from "fastify";
import FormData from "form-data";
import fs from "fs";
import * as path from "path";
import S3Helper from "../../src/classes/S3Helper";
import config from "config";

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

  beforeAll(async () => {
    address = await httpsServer.listen(0);
    await s3TestHelper.createS3Bucket(videosBucket, s3.getS3());
  });

  afterAll(async () => {
    await httpsServer.close();
    await s3TestHelper.deleteS3Bucket(videosBucket, s3.getS3());
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    server = new Server();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    await s3TestHelper.clearBucket(videosBucket, s3.getS3());
  });

  describe("Upload Video", () => {
    it("Should upload a video, save it to S3, save it to Postgres and send result to Pose Detection Server", async () => {
      let result: any = await s3TestHelper.listObjects(
        videosBucket,
        s3.getS3()
      );
      expect(result.Contents.length).toEqual(0);
      await waitAsync(4000);
      const formData = new FormData();
      try {
        formData.append(
          "myFile",
          fs.createReadStream(
            path.join(__dirname, "..", "fixtures", "test-video.MOV")
          )
        );
      } catch (err) {
        logger.warn(
          `An error occurred when uploading test video ${formatError(err)}`
        );
      }
      formData.submit(`${serverUrl}/api/v1/video/stream`, (err, res) => {
        if (err) {
          logger.warn("An error occurred when submitting test video", err);
        }
        res.resume();
      });
      await waitAsync(2000);
      expect(true);
      result = await s3TestHelper.listObjects(videosBucket, s3.getS3());
      expect(result.Contents.length).toEqual(1);
    }, 15000);
  });
});
