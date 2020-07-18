import { createLogger, format, transports } from "winston";
const { combine, timestamp, json } = format;

export const formatError = (err: any) => {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  } else {
    return err;
  }
};

export function getLogger() {
  return createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), json()),
    transports: [
      new transports.Console({
        silent: process.env.NODE_ENV === "test" && !process.env.LOG_LEVEL,
      }),
    ],
  });
}
