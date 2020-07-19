import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import Busboy from "busboy";
import Upload from "../../../classes/Upload";
import S3Helper from "../../../classes/S3Helper";
import config from "config";
import { Video } from "../../../entity/Video";
import Database from "../../../classes/Database";
import PoseService from "../../../classes/PoseService";
import validationMiddleware from "../../middlewares/validation";
import uploadVideoSchema from "../../schemas/uploadVideoSchema";

const route = Router();
const logger = getLogger();

export default (app: Router) => {
  app.use("/v1/video", route);
  const s3Config: any = config.get("s3");
  const s3 = new S3Helper(s3Config);
  const db = new Database("video-connection");
  const poseService = new PoseService(config.get("poseService"));

  // Responsible for saving request in database and returning id etc to client
  route.post(
    "/create",
    validationMiddleware(uploadVideoSchema, "body"),
    async (req: Request, res: Response) => {
      logger.info(`Received request to /create ${util.inspect(req.body)}`);

      const video = new Video();
      video.user_id = req.body.userId;
      video.name = req.body.name;
      video.description = req.body.description;
      video.is_processed = false;
      video.angle_of_shot = req.body.angleOfShot;
      video.type_of_shot = req.body.typeOfShot;
      video.storage_uri = "";
      video.feedback = "";
      video.uploaded_timestamp = new Date(req.body.uploadedTimestamp);
      try {
        const result = await db.writeVideoResult(video);
        // TODO: Might want to do snakecase to camelcase conversion here
        res.status(201).json(result);
      } catch (err) {
        logger.warn(
          `An error occurred when writing video ${util.inspect(
            video
          )} to database ${formatError(err)}`
        );
        res.send(500);
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

    let uploadUriPromise: Promise<any>;
    let key = "";
    busboy.on("file", function (fieldname, file) {
      key = fieldname.substring(0, fieldname.indexOf("."));
      const { writeStream, managedUpload } = s3.upload(
        s3Config.videosBucket,
        key
      );
      uploadUriPromise = Upload.uploadFileToS3(s3.getS3(), managedUpload);
      file.on("data", function (data) {
        writeStream.write(data);
      });
      file.on("end", async () => {
        logger.debug("File [" + fieldname + "] Finished");
        await util.promisify(writeStream.end).bind(writeStream)();
        logger.debug("Closed relevant streams");
      });
    });

    busboy.on("finish", async () => {
      logger.debug("Done parsing form!");
      const uploadUri = await uploadUriPromise;

      try {
        if (!key) {
          throw new Error("Missing key");
        }
        await db.updateVideoResult(key, uploadUri);
        await poseService.sendRequest(uploadUri);
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
