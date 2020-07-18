import express, { Express, Router } from "express";
import bodyParser from "body-parser";
import user from "../api/routes/v1/video";
import cors from "cors";
import config from "config";
import { getLogger } from "../utils/Logging";

const logger = getLogger();

export const setupExpress = (): Express => {
  const router = Router();
  // Setup Routes
  user(router);

  const app = express()
    .use(cors())
    .use(express.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(config.get("api.prefix"), router);

  logger.info("Setup Express");
  return app;
};
