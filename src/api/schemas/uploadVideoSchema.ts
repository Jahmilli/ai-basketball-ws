import Joi from "@hapi/joi";

const uploadVideoSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  angleOfShot: Joi.string().required(),
  typeOfShot: Joi.string().required(),
  // uploadedTimestamp: Joi.date().required(), // This should be what is used but will look at it later....
  uploadedTimestamp: Joi.string().required(),
});

export default uploadVideoSchema;
