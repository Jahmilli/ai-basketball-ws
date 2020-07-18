
const mockConfigGet = jest.fn();
jest.mock("config", () => {
  return {
    get: mockConfigGet
  };
});

import Server from "../../src/Server";
import {
  TestData,
  decode,
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

describe("End-2-End test", () => {
  const serverUrl = "http://localhost:4993";
  let server: Server;
  let uid: number;
  let address: string;

  beforeAll(async () => {
    address = await httpsServer.listen(0);
  });
  afterAll(async () => {
    await httpsServer.close();
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
    await waitAsync(4000); // Wait for Kafka groups to balance
  });

  afterEach(async () => {
    await server.stop();
  }, 40000);

  describe("Upload Video", () => {
    expect(true);
    // TODO: Add test here...
  });
});
