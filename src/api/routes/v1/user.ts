import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import Busboy from "busboy";
import Upload from "../../../services/Upload";
import S3Helper from "../../../modules/S3Helper";
import config from "config";
import { User } from "../../../entity/User";
import Database from "../../../modules/Database";
import PoseService from "../../../services/PoseService";
import validationMiddleware from "../../middlewares/validation";
import uploadVideoSchema from "../../schemas/uploadVideoSchema";
import { IS3Config } from "IConfig";

const route = Router();
const logger = getLogger();

export default (app: Router): void => {
  const s3Config: IS3Config = config.get("s3");
  const s3 = new S3Helper(s3Config);
  const db = new Database("video-connection");
  const poseService = new PoseService(config.get("poseService"));
  const upload = new Upload();
  app.use("/v1/user", route);

  // Responsible for saving request in database and returning id etc to client
  route.post(
    "/create",
    validationMiddleware(uploadVideoSchema, "body"),
    async (req: Request, res: Response) => {
      logger.info(`Received request to /create ${util.inspect(req.body)}`);

      const user = new User();
      user.createdTimestamp = new Date();

      try {
        const result = await db.createUser(user);
        return res.status(201).json(result);
      } catch (err) {
        logger.warn(
          `An error occurred when creating user ${util.inspect(
            user
          )} to database ${formatError(err)}`
        );
        return res.sendStatus(500);
      }
    }
  );
};
