import Joi from "joi";
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(8).required(),
});
export default authSchema;
