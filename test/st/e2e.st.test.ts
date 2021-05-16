/* eslint @typescript-eslint/ban-ts-comment: 0 */
const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet,
  };
});

import config from "config";
import fastify from "fastify";
import * as path from "path";
import request from "supertest";
import { IPoseServiceConfig, IS3Config } from "../../src/interfaces/IConfig";
import S3Helper from "../../src/modules/S3Helper";
import Server from "../../src/Server";
import { getLogger } from "../../src/utils/Logging";
import {
  DatabaseTestHelper,
  getExpectedDbResult,
  getTestRequest,
  S3TestHelper,
  setTestSecrets,
  waitAsync,
} from "../utils/TestHelper";

const logger = getLogger();
const httpsServer = fastify();

const mockPoseService = jest.fn();
const poseServicePath = "/pose/create";
const videosBucket = "test-bucket";
let poseServiceReceived: any = {};

httpsServer.post(poseServicePath, {}, async (request, reply) => {
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
  let s3Helper: S3Helper;
  const dbTestHelper = new DatabaseTestHelper("test-connection");
  let address: string;
  const s3TestHelper = new S3TestHelper();

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
          } as IS3Config;
        }
        case "poseService": {
          return {
            endpoint: address,
            path: poseServicePath,
          } as IPoseServiceConfig;
        }
        default:
          // Return actual value for all but above
          return jest.requireActual("config").get(key);
      }
    });

    s3Helper = new S3Helper(config.get("s3"));
    await s3TestHelper.createS3Bucket(videosBucket, s3Helper.s3);
    await dbTestHelper.start();
  });

  afterAll(async () => {
    await httpsServer.close();
    await dbTestHelper.stop();
    await s3TestHelper.deleteS3Bucket(videosBucket, s3Helper.s3);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    setTestSecrets();
    poseServiceReceived = {};
    await dbTestHelper.deleteAllVideoRows();

    server = new Server();
    await server.start();
    await waitAsync(2000);
  }, 10000);

  afterEach(async () => {
    await server.stop();
    await s3TestHelper.clearBucket(videosBucket, s3Helper.s3);
  });

  describe("Upload Video", () => {
    it.each([
      "userId",
      "name",
      "description",
      "angleOfShot",
      "typeOfShot",
      "createdTimestamp",
    ])(
      "Should return 400 if field %s is missing from the request body",
      async (field: string) => {
        let dbResult = await dbTestHelper.getVideoRows();
        expect(dbResult.length).toEqual(0);

        const requestBody = getTestRequest();
        // @ts-ignore
        delete requestBody[field];

        await request(serverUrl)
          .post("/v1/video/create")
          .send(requestBody)
          .expect(400);
        dbResult = await dbTestHelper.getVideoRows();
        expect(dbResult.length).toEqual(0);
      }
    );

    it("Should upload video information, save it to Postgres and return video details back to client", async () => {
      let dbResult = await dbTestHelper.getVideoRows();
      expect(dbResult.length).toEqual(0);

      const requestBody = getTestRequest();

      await request(serverUrl)
        .post("/v1/video/create")
        .send(requestBody)
        .then((res) => {
          expect(res.status).toEqual(201);
          expect(res.body).toMatchObject(getExpectedDbResult());
        });

      dbResult = await dbTestHelper.getVideoRows();
      // TODO: Assert row values are correct...
      expect(dbResult.length).toEqual(1);
    });

    it("Should upload a video, save it to S3, save it to Postgres and send result to Pose Service", async () => {
      mockPoseService.mockReturnValueOnce(200);
      let s3Result = await s3TestHelper.listObjects(videosBucket, s3Helper.s3);
      expect(s3Result.Contents.length).toEqual(0);
      let dbResult = await dbTestHelper.getVideoRows();
      expect(dbResult.length).toEqual(0);

      let resultId = "";
      await request(serverUrl)
        .post("/v1/video/create")
        .send(getTestRequest())
        .then((res) => {
          resultId = res.body.id;
          expect(res.status).toEqual(201);
          expect(res.body).toMatchObject(getExpectedDbResult());
        });

      await request(serverUrl)
        .post("/v1/video/stream")
        .attach(
          `${resultId}.MOV`,
          path.join(__dirname, "..", "fixtures", "test-video.MOV")
        )
        .expect(201);

      s3Result = await s3TestHelper.listObjects(videosBucket, s3Helper.s3);
      expect(s3Result.Contents.length).toEqual(1);
      dbResult = await dbTestHelper.getVideoRows();

      const expectedUri = /^s3\:\/\/test-bucket\/\w*-.*\w*$/;
      expect(poseServiceReceived.videoUri).toMatch(expectedUri);
      expect(dbResult.length).toEqual(1);
      expect(dbResult[0]).toMatchObject({
        ...getExpectedDbResult(),
        storage_uri: expectedUri,
        createdTimestamp: new Date("2020-07-19T02:45:32.722Z"),
      });
    }, 15000);
  });
});
