import Joi from "joi";

const userSchema = Joi.object({
  first_name: Joi.string().min(3).max(14).required(),
  last_name: Joi.string().min(3).max(8).required(),

  contact: Joi.string()
    .pattern(/^[0-9]{10,12}$/)
    .required(),
});

export default userSchema;
