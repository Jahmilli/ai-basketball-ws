import { Router, Request, Response, NextFunction } from "express";
import util from "util";
import { formatError, getLogger } from "../../../utils/Logging";
import { User } from "../../../entity/User";
import Database from "../../../modules/Database";
import validationMiddleware from "../../middlewares/validation";
import { createUserSchema } from "../../../api/schemas/UserSchema";
import {
  resourceCreated,
  internalServerError,
  notFoundError,
} from "../../../utils/Constants";

const route = Router();
const logger = getLogger();

export default (app: Router): void => {
  const db = new Database("video-connection");
  app.use("/v1/user", route);

  route
    .get(
      "/:userId",
      async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        logger.info(`Received GET request to / for userId ${userId}`);

        try {
          // TODO: Move all of this into a service class, should not be done from here...
          const user = await db.findUser(userId);
          if (!user) {
            // TODO: Use error handler for this,
            return res.status(notFoundError.statusCode).json(notFoundError);
          }
          return res.status(200).json({
            ...user,
            dateOfBirth: user.dateOfBirth.getTime(),
            lastUpdated: user.lastUpdated.getTime(),
            createdTimestamp: user.createdTimestamp.getTime(),
          });
        } catch (err) {
          logger.warn(
            `An error occurred when getting user with userId ${userId} with error ${formatError(
              err
            )}`
          );
          return next(err);
        }
      }
    )
    .post(
      "/create",
      validationMiddleware(createUserSchema, "body"),
      async (req: Request, res: Response, next: NextFunction) => {
        logger.info(
          `Received POST request to /create ${util.inspect(req.body)}`
        );
        // TODO: Move all of this into a service class, should not be done from here..
        const { id, email, firstName, lastName, dateOfBirth } = req.body;
        const user = new User();
        user.id = id;
        user.email = email;
        user.firstName = firstName;
        user.lastName = lastName;
        user.dateOfBirth = new Date(dateOfBirth);

        try {
          const result = await db.findUser(user.id);
          if (!!result) {
            logger.warn(
              `Cannot create new user with id ${user.id} as user already exists`
            );
            return res
              .status(internalServerError.statusCode)
              .json(internalServerError);
          }
          await db.createUser(user);
          return res.status(resourceCreated.statusCode).json(resourceCreated);
        } catch (err) {
          logger.warn(
            `An error occurred when creating user ${util.inspect(
              user
            )} to database ${formatError(err)}`
          );
          return next(err);
        }
      }
    );
};
