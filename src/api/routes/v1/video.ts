import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import validationMiddleware from "../../middlewares/validation";
import uploadVideoSchema from "../../schemas/uploadVideoSchema";
import Busboy from "busboy";
import Upload from "../../../classes/Upload";
import S3Helper from "../../../classes/S3Helper";
import config from "config";
import { Video } from "../../../entity/Video";
import Database from "../../../classes/Database";

const route = Router();
const logger = getLogger();

export default (app: Router) => {
  app.use("/v1/video", route);
  const s3Config: any = config.get("s3");
  const s3 = new S3Helper(s3Config);
  const db = new Database("video-connection");

  // TODO: Refactor this insanely large handler...
  route.post("/stream", async (req: Request, res: Response) => {
    logger.info(
      `Received multipart request with body ${util.inspect(req.body)}`
    );

    const key = `${Date.now()}-basketball.MOV`;
    const { writeStream, managedUpload } = s3.upload(
      s3Config.videosBucket,
      key
    );

    // Can probably move BusBoy into its own class...
    const busboy = new Busboy({ headers: req.headers });
    req.pipe(busboy);
    const uploadUriPromise = Upload.uploadFileToS3(s3.getS3(), managedUpload);

    busboy.on("file", function (fieldname, file) {
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

      const video = new Video();
      video.name = "Temporary video name";
      video.description = "This is a temporary description";
      video.is_processed = false;
      video.created_by = "Test User";
      video.storage_uri = uploadUri;
      video.feedback = "";

      try {
        await db.writeVideoResult(video);
        // TODO: Determine what the response here should be
        res.writeHead(201, { Connection: "close", Location: "/" });
      } catch (err) {
        logger.warn(
          `An error occured when writing database result ${formatError(err)}`
        );
        // TODO: Determine what the response here should be
        res.writeHead(500, { Connection: "close", Location: "/" });
      }

      res.end();
    });
  });
};
