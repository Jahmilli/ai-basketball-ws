import express, { Express, Router } from "express";
import bodyParser from "body-parser";
import video from "../api/routes/v1/video";
import cors from "cors";
import config from "config";
import { getLogger } from "../utils/Logging";

export const setupExpress = (): Express => {
  const router = Router();
  // Setup Routes
  video(router);

  const app = express()
    .use(cors())
    .use(express.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(config.get("api.prefix") as string, router);

  getLogger().info("Setup Express");
  return app;
};
