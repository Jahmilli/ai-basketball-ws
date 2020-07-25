import { formatError, getLogger } from "./Logging";
import * as winston from "winston";

describe("Logging", () => {
  describe("formatError", () => {
    it("Should return Error: <message> for type Error", () => {
      expect(formatError(new Error("custom error message"))).toEqual(
        "Error: custom error message"
      );
    });
    it("Should return EvalError: <message> for type EvalError", () => {
      expect(formatError(new EvalError("custom error message"))).toEqual(
        "EvalError: custom error message"
      );
    });
    it("Should return <message> for non-Error types", () => {
      expect(formatError("custom error message")).toEqual(
        "custom error message"
      );
    });
  });
  describe("getLogger", () => {
    let nodeEnv: string | undefined;
    let logLevel: string | undefined;

    beforeEach(() => {
      nodeEnv = process.env.NODE_ENV;
      logLevel = process.env.LOG_LEVEL;
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;
    });
    afterEach(() => {
      process.env.NODE_ENV = nodeEnv;
      process.env.LOG_LEVEL = logLevel;
    });
    it("Should return console logger with default info level", () => {
      const logger = getLogger();
      expect(logger.level).toEqual("info");
      expect(logger.transports[0]).toBeInstanceOf(winston.transports.Console);
      expect(logger.transports[0].silent).toEqual(false);
    });
    it("Should return silent console logger if NODE_ENV is test", () => {
      process.env.NODE_ENV = "test";
      const logger = getLogger();
      expect(logger.level).toEqual("info");
      expect(logger.transports[0]).toBeInstanceOf(winston.transports.Console);
      expect(logger.transports[0].silent).toEqual(true);
    });
    it("Should return non silent console logger if NODE_ENV is test and LOG_LEVEL is set", () => {
      process.env.NODE_ENV = "test";
      process.env.LOG_LEVEL = "info";
      const logger = getLogger();
      expect(logger.level).toEqual("info");
      expect(logger.transports[0]).toBeInstanceOf(winston.transports.Console);
      expect(logger.transports[0].silent).toEqual(false);
    });
    it("Should override loglevel", () => {
      process.env.LOG_LEVEL = "debug";
      const logger = getLogger();
      expect(logger.level).toEqual("debug");
    });
  });
});
