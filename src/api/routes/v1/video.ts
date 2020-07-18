import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import validationMiddleware from "../../middlewares/validation";
import uploadVideoSchema from "../../schemas/uploadVideoSchema";
import Busboy from "busboy";
import fs from "fs";
import Upload from "../../../classes/Upload";
import * as stream from "stream";
import S3Helper from "../../../classes/S3Helper";
import config from "config";

const route = Router();
const logger = getLogger();

export default (app: Router) => {
  app.use("/v1/video", route);
  const s3Config: any = config.get("s3");
  const s3 = new S3Helper(s3Config);

  route.post("/stream", async (req: Request, res: Response) => {
    logger.info(
      `Received multipart request with body ${util.inspect(req.body)}`
    );

    const key = `${Date.now()}-basketball.MOV`;
    const { writeStream, managedUpload } = s3.upload(
      s3Config.videosBucket,
      key
    );
    // const newStream = new stream.Readable();

    Upload.uploadFileToS3(s3.getS3(), managedUpload);

    const busboy = new Busboy({ headers: req.headers });
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
    busboy.on("finish", function () {
      logger.debug("Done parsing form!");
      res.writeHead(303, { Connection: "close", Location: "/" });
      res.end();
    });
    req.pipe(busboy);
  });
};
