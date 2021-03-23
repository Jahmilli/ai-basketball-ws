import { NextFunction, Request, Response } from "express";
import { getLogger } from "../../utils/Logging";
import Joi from "@hapi/joi";
import { inspect } from "util";

const logger = getLogger();

const validationMiddleware = (
  schema: Joi.ObjectSchema,
  property: "body" | "query"
) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.validate(req[property]);
  const { error } = result;
  const valid = error == null;
  if (!valid) {
    logger.info(
      `Invalid request was made for property ${property} ${JSON.stringify(
        req[property]
      )} with error ${inspect(error)}`
    );
    res.status(400).json({
      message: "Invalid request",
      data: req.body,
    });
    return;
  }

  next();
};

export default validationMiddleware;
