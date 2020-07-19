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
import fastify from "fastify";
import * as path from "path";
import S3Helper from "../../src/classes/S3Helper";
import config from "config";
import request from "supertest";

const logger = getLogger();
const httpsServer = fastify();

const mockPoseService = jest.fn();
const poseServicePath = "/pose/create";
const videosBucket = "test-bucket";
let poseServiceReceived = {};

httpsServer.post(poseServicePath, {}, async (request: any, reply: any) => {
  logger.debug(
    `Received request in test server with body ${JSON.stringify(request.body)}`
  );
  poseServiceReceived = request.body; // Used to perform assertions on what was received
  await waitAsync(100);
  reply
    .code(
      mockPoseService({
        message: "Success",
      })
    )
    .send();
});

describe("End-2-End test", () => {
  const serverUrl = "http://localhost:4993";
  let server: Server;
  let s3: S3Helper;
  const dbTestHelper = new DatabaseTestHelper("test-connection");
  let address: string;

  beforeAll(async () => {
    address = await httpsServer.listen(0);

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
        case "poseService": {
          return {
            endpoint: address,
            path: poseServicePath,
          };
        }
        default:
          // Return actual value for all but above
          return jest.requireActual("config").get(key);
      }
    });

    s3 = new S3Helper(config.get("s3"));
    await s3TestHelper.createS3Bucket(videosBucket, s3.getS3());
    await dbTestHelper.start();
  });

  afterAll(async () => {
    await httpsServer.close();
    await dbTestHelper.stop();
    await s3TestHelper.deleteS3Bucket(videosBucket, s3.getS3());
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    poseServiceReceived = {};
    await dbTestHelper.deleteAllVideoRows();

    server = new Server();
    await server.start();
    await waitAsync(2000);
  }, 10000);

  afterEach(async () => {
    await server.stop();
    await s3TestHelper.clearBucket(videosBucket, s3.getS3());
  });

  describe("Upload Video", () => {
    it("Should upload a video, save it to S3, save it to Postgres and send result to Pose Detection Server", async () => {
      // Arrange
      mockPoseService.mockReturnValueOnce(200);
      let s3Result: any = await s3TestHelper.listObjects(
        videosBucket,
        s3.getS3()
      );
      expect(s3Result.Contents.length).toEqual(0);
      let dbResult = await dbTestHelper.getVideoRows();
      expect(dbResult.length).toEqual(0);

      // Act
      await request(`${serverUrl}`)
        .post("/api/v1/video/stream")
        .attach(
          "myFile",
          path.join(__dirname, "..", "fixtures", "test-video.MOV")
        )
        .expect(201);

      // Assert
      s3Result = await s3TestHelper.listObjects(videosBucket, s3.getS3());
      expect(s3Result.Contents.length).toEqual(1);
      dbResult = await dbTestHelper.getVideoRows();
      // TODO: Assert row values are correct...
      expect(dbResult.length).toEqual(1);
      expect(poseServiceReceived).toEqual({
        videoUri: "s3://test-bucket/basketball.MOV",
      });
    }, 15000);
  });
});
