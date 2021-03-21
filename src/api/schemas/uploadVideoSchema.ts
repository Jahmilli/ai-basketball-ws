import Joi from "@hapi/joi";

export const uploadVideoSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  angleOfShot: Joi.string().required(),
  typeOfShot: Joi.string().required(),
  // createdTimestamp: Joi.number().required(),
});
