import Joi from "@hapi/joi";

const uploadVideoSchema = Joi.object({
  userId: Joi.string().required(),
});

export default uploadVideoSchema;
