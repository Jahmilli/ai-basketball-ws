import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import Busboy from "busboy";
import Upload from "../../../services/Upload";
import S3Helper from "../../../modules/S3Helper";
import config from "config";
import { Video } from "../../../entity/Video";
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
  app.use("/v1/video", route);

  route.get("/", async (req: Request, res: Response) => {
    logger.info(`Received GET request to /video ${util.inspect(req.body)}`);
    if (!req.query.userId) {
      logger.info(`Received request without query param`);
      return res.sendStatus(400);
    }

    // @ts-ignore TODO: Maybe a path param makes more sense than a query param here...
    const result = await db.getVideosForUser(req.query.userId);
    console.log("result is ", result);
    res.json(result);
  });
  // Responsible for saving request in database and returning id etc to client
  route.post(
    "/",
    validationMiddleware(uploadVideoSchema, "body"),
    async (req: Request, res: Response) => {
      logger.info(`Received request to /create ${util.inspect(req.body)}`);

      const video = new Video();
      video.userId = req.body.userId;
      video.name = req.body.name;
      // TODO: Set default values from database...
      video.description = req.body.description;
      video.isProcessed = false;
      video.angleOfShot = req.body.angleOfShot;
      video.typeOfShot = req.body.typeOfShot;
      video.storageUri = "";
      video.feedback = null;
      video.createdTimestamp = new Date();

      try {
        const result = await db.writeVideoResult(video);
        return res.status(201).json(result);
      } catch (err) {
        logger.warn(
          `An error occurred when writing video ${util.inspect(
            video
          )} to database ${formatError(err)}`
        );
        return res.sendStatus(500);
      }
    }
  );

  // TODO: Refactor this insanely large handler...
  route.post("/stream", async (req: Request, res: Response) => {
    logger.info(
      `Received multipart request with body ${util.inspect(req.body)}`
    );

    // Can probably move BusBoy into its own class...
    const busboy = new Busboy({ headers: req.headers });
    req.pipe(busboy);

    let uploadUriPromise: Promise<string>;
    let fileId = "";
    busboy.on("file", (fieldname, file) => {
      logger.info("fieldname is ", fieldname);
      fileId = fieldname.substring(0, fieldname.indexOf("."));
      const { writeStream, managedUpload } = s3.upload(
        s3Config.videosBucket,
        fieldname
      );
      uploadUriPromise = upload.uploadFileToS3(managedUpload);
      file.on("data", (data) => {
        writeStream.write(data);
      });
      file.on("end", async () => {
        logger.debug(`File [${fieldname}] Finished`);
        await util.promisify(writeStream.end).bind(writeStream)();
        logger.debug("Closed relevant streams");
      });
    });

    busboy.on("finish", async () => {
      logger.debug("Done parsing form!");
      const uploadUri = await uploadUriPromise;

      try {
        if (!fileId) {
          throw new Error("Missing key");
        }
        await db.updateVideoResult(fileId, uploadUri);
        await poseService.sendRequest(fileId, uploadUri);
        // TODO: Determine what the response here should be
        res.writeHead(201, { Connection: "close", Location: "/" });
      } catch (err) {
        logger.warn(`An error occured ${formatError(err)}`);
        // TODO: Determine what the response here should be
        res.writeHead(500, { Connection: "close", Location: "/" });
      }

      res.end();
    });
  });
};
