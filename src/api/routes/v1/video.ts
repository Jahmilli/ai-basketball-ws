import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import validationMiddleware from "../../middlewares/validation";
import uploadVideoSchema from "../../schemas/uploadVideoSchema";

const route = Router();
const logger = getLogger();

export default (app: Router) => {
  app.use("/v1/video", route);

  route.post(
    "/upload",
    validationMiddleware(uploadVideoSchema, "body"),
    async (req: Request, res: Response) => {
      logger.info(`Received request with body ${util.inspect(req.body)}`);

      try {
        res.json({ message: "Success" });
      } catch (err) {
        logger.warn(
          `An error occurred when trying to activate ${formatError(err)}`
        );
        res.sendStatus(500);
        // Probably do next(err) here and add in custom error handling...
      }
    }
  );
};
