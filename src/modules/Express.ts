import cors from "cors";
import express, { Express, Request, Response, Router } from "express";
import { errorHandler } from "../api/middlewares/errorHandler";
import user from "../api/routes/v1/user";
import video from "../api/routes/v1/video";
import { getLogger } from "../utils/Logging";

export const setupExpress = (): Express => {
  const logger = getLogger();
  const router = Router();
  // Setup Routes
  video(router);
  user(router);

  const app = express()
    .use(cors())
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(router)
    .use((req: Request, res: Response) => {
      logger.info(`Received request in 404 handler for path ${req.path}`);
      return res.status(404).json({
        statusCode: 404,
        message: "Not found",
      });
    })
    .use(errorHandler);

  getLogger().info("Setup Express");
  return app;
};
