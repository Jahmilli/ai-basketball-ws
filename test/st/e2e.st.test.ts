
const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet
  };
});

import Server from "../../src/Server";
import { S3 } from "aws-sdk";
import {
  s3TestHelper,
  waitAsync
} from "../utils/TestHelper";
import { getLogger } from "../../src/utils/Logging";
import { PassThrough } from "stream";
import request from "supertest";
import fastify from "fastify";

const logger = getLogger();
const httpsServer = fastify();

const mockRecognitionServer = jest.fn();
// let responseDelayMs = 0;
// Setup routes for the next ws we call...
httpsServer.post("/routine/create", {}, async (request: any, reply: any) => {
  logger.debug(`Received request in test server with body ${JSON.stringify(request.body)}`);
  // await waitAsync(responseDelayMs);
  await waitAsync(100);
  reply.code(mockRecognitionServer(
    {
      message: "Success"
    }
  )).send();
});

const videosBucket = "ai.basketball.videos";

describe("End-2-End test", () => {
  const serverUrl = "http://localhost:4993";
  let server: Server;
  let uid: number;
  let address: string;
  let s3 = new S3();

  beforeAll(async () => {
    address = await httpsServer.listen(0);
    await s3TestHelper.createS3Bucket(videosBucket, s3);
  });

  afterAll(async () => {
    await httpsServer.close();
    await s3TestHelper.deleteS3Bucket(videosBucket, s3);

  });

  beforeEach(async () => {
    jest.clearAllMocks();
    uid = Date.now();
    mockConfigGet.mockImplementation((key: string) => {
      switch (key) {
        default:
          // Return actual value for all but above
          return jest.requireActual("config").get(key);
      }
    });
    server = new Server();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    await s3TestHelper.clearBucket(videosBucket, s3);
  }, 40000);

  describe("Upload Video", async () => {
    let result: any = await s3TestHelper.listObjects(videosBucket, s3);
    expect(result.Contents.length).toEqual(0);

    const formData = new FormData();
    // TODO: Figure out how we upload the video!!!!
    await request(serverUrl)
      .post("/v1/video/upload")
      // .set("Content-Type", "application/json") // Will need to determine content-type
      .send({ message: "hello" })
      .expect(200, {
        message: "Uploaded..."
      });

    result = await s3TestHelper.listObjects(videosBucket, s3);
    expect(result.Contents.length).toEqual(1);
  });
});
