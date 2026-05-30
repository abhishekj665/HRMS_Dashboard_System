import Joi from "joi";

const profileSchema = Joi.object({
  first_name: Joi.string().min(2).max(30).allow("", null),
  last_name: Joi.string().min(2).max(30).allow("", null),
  contact: Joi.string()
    .pattern(/^[0-9]{10,12}$/)
    .allow("", null),
  address: Joi.string().allow("", null),
  pincode: Joi.string().max(10).allow("", null),
  country: Joi.string().max(60).allow("", null),
  state: Joi.string().max(60).allow("", null),
  city: Joi.string().max(60).allow("", null),
  age: Joi.number().integer().min(0).max(120).allow(null),
  profileUrl: Joi.string().uri().allow("", null),
  adharUrl: Joi.string().uri().allow("", null),
  panCardUrl: Joi.string().uri().allow("", null),
  adharNumber: Joi.string().max(20).allow("", null),
  panNumber: Joi.string().max(20).allow("", null),
  accountNumber: Joi.string().max(30).allow("", null),
}).min(1);

export default profileSchema;
