import { Router, Request, Response } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import validationMiddleware from "../../middlewares/validation";
import uploadVideoSchema from "../../schemas/uploadVideoSchema";
import Busboy from "busboy";
import Upload from "../../../classes/Upload";
import S3Helper from "../../../classes/S3Helper";
import config from "config";

const routes = (app: Router) => {
  const route = Router();
  const logger = getLogger();
  const s3Config = config.get("s3");
  app.use("/v1/video", route);
  const s3 = new S3Helper(s3Config);

  route.post(
    "/stream",
    // validationMiddleware(uploadVideoSchema, "body"),
    async (req: Request, res: Response) => {
      logger.info(
        `Received multipart request with body ${util.inspect(req.body)}`
      );
      const key = `${Date.now()}-basketball.MOV`;
      const { writeStream, managedUpload } = s3.upload(config.get("s3"), key);

      Upload.uploadFileToS3(s3.getS3(), managedUpload);

      const busboy = new Busboy({ headers: req.headers });
      busboy.on("file", function (
        fieldname,
        file,
        filename,
        encoding,
        mimetype
      ) {
        file.on("data", async (data) => {
          console.log("File [" + fieldname + "] got " + data.length + " bytes");
          await new Promise((resolve) => {
            if (!writeStream.write(data)) {
              writeStream.once("drain", resolve);
            } else {
              process.nextTick(resolve);
            }
          });
        });
        file.on("end", () => {
          console.log("File [" + fieldname + "] Finished");
          writeStream.end(() => {
            console.log("writestream ended");
          });
        });
      });
      busboy.on("finish", () => {
        logger.info("Done parsing form!");
        res.writeHead(303, { Connection: "close", Location: "/" });
        res.end();
      });
      req.pipe(busboy);
    }
  );
};

export default routes;
