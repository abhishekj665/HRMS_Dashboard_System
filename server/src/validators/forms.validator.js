import Joi from "joi";

const text = (max = 500) => Joi.string().trim().max(max);
const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });
const date = Joi.date().iso();

export const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
  otp: Joi.string().trim().pattern(/^\d{4,8}$/).required(),
  purpose: Joi.string().trim().valid("SIGNUP", "FORGOT_PASSWORD", "VERIFY_EMAIL").insensitive().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
  otp: Joi.string().trim().pattern(/^\d{4,8}$/).required(),
  purpose: Joi.string().trim().valid("SIGNUP", "FORGOT_PASSWORD").insensitive().optional(),
  newPassword: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

export const resendOtpSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
  purpose: Joi.string().trim().valid("SIGNUP", "FORGOT_PASSWORD").insensitive().required(),
});

export const leaveRequestSchema = Joi.object({
  leaveTypeId: uuid.required(),
  startDate: date.required(),
  endDate: date.min(Joi.ref("startDate")).required(),
  reason: text(2000).min(3).required(),
  isHalfDay: Joi.boolean().default(false),
}).required();

export const assetRequestSchema = Joi.object({
  assetId: uuid.allow(null, "").optional(),
  quantity: Joi.number().integer().min(1).max(5).required(),
  title: text(120).min(2).required(),
  description: text(2000).allow("", null).optional(),
}).required();

export const expenseSchema = Joi.object({
  amount: Joi.number().positive().precision(2).max(99999999.99).required(),
  expenseDate: date.max("now").required(),
  pin: Joi.string().pattern(/^\d{4,12}$/).required(),
}).required();

export const accountSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
  pin: Joi.string().pattern(/^\d{4,12}$/).required(),
}).required();

export const accountUpdateSchema = Joi.object({
  newEmail: Joi.string().trim().email().max(254).required(),
  pin: Joi.string().pattern(/^\d{4,12}$/).required(),
}).required();

export const departmentSchema = Joi.object({
  name: text(100).min(2).required(),
}).required();

export const remarkSchema = Joi.object({
  remark: text(2000).allow("", null).optional(),
}).required();

export const adminRemarkSchema = Joi.object({
  adminRemark: text(2000).allow("", null).optional(),
}).required();

export const ipSchema = Joi.object({
  ip: Joi.string().ip({ version: ["ipv4", "ipv6"] }).required(),
}).required();

export const bulkAttendanceSchema = Joi.object({
  ids: Joi.array().items(uuid).min(1).max(500).required(),
  remark: text(2000).allow("", null).optional(),
}).required();
