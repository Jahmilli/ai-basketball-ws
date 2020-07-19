import Joi from "@hapi/joi";

const uploadVideoSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  angleOfShot: Joi.string().required(),
  typeOfShot: Joi.string().required(),
  uploadedTimestamp: Joi.date().required(),
});

export default uploadVideoSchema;
