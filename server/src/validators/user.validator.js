import Joi from "joi";

const userSchema = Joi.object({
  first_name: Joi.string().min(2).max(30).optional(),
  last_name: Joi.string().min(2).max(30).optional(),

  contact: Joi.string()
    .pattern(/^[0-9]{10,12}$/)
    .optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
}).min(1);

export default userSchema;
