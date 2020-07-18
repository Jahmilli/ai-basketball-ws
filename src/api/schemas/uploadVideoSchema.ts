import Joi from "@hapi/joi";

const uploadVideoSchema = Joi.object({
  message: Joi.string().required(),
});

export default uploadVideoSchema;
