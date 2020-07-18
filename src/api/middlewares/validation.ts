import { NextFunction, Request, Response } from "express";
import { getLogger } from "../../utils/Logging";

const logger = getLogger();

const validationMiddleware = (schema: any, property: "body" | "query") => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.validate(req.body);
  const { error } = result;
  const valid = error == null;
  if (!valid) {
    logger.info(`Invalid request was made ${JSON.stringify(req[property])}`);
    res.status(400).json({
      message: "Invalid request",
      data: req.body,
    });
    return;
  }

  next();
};

export default validationMiddleware;
