import Joi from "@hapi/joi";

export const createUserSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.number().required(),
  // lastUpdated: Joi.number().required(),
  // createdTimestamp: Joi.number().required(),
});
