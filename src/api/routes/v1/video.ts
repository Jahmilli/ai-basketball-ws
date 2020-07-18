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
  const db = new Database();

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
    const uploadUri = Upload.uploadFileToS3(s3.getS3(), managedUpload);

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
    // TODO: Determine what the response here should be
    busboy.on("finish", async () => {
      logger.debug("Done parsing form!");
      let newResult = await uploadUri;

      const video = new Video();
      video.name = "VideoName";
      video.description = "This is a test description";
      video.is_processed = false;
      video.created_by = "Seb";
      video.storage_uri = newResult;
      video.feedback = "This is some feedback";

      await db.writeVideoResult(video);

      res.writeHead(201, { Connection: "close", Location: "/" });
      res.end();
    });
  });
};
