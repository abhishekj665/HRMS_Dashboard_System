import Joi from "joi";

export const internalReferralSchema = Joi.object({
  candidateName: Joi.string().trim().min(2).max(150).required(),
  candidateEmail: Joi.string().trim().email().max(254).required(),
  candidatePhone: Joi.string().trim().allow("").max(20).optional(),
  note: Joi.string().trim().allow("").max(2000).optional(),
});

export const internalApplicationSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().max(254).required(),
  contact: Joi.string().trim().pattern(/^[+\d\s()-]{7,20}$/).required(),
  address: Joi.string().trim().min(1).max(500).required(),
  city: Joi.string().trim().min(1).max(100).required(),
  state: Joi.string().trim().min(1).max(100).required(),
  country: Joi.string().trim().min(1).max(100).required(),
  currentCompany: Joi.string().trim().min(1).max(150).required(),
  totalExperience: Joi.number().min(0).max(80).required(),
  currentCTC: Joi.number().min(0).required(),
  expectedCTC: Joi.number().min(0).required(),
  noticePeriodDays: Joi.number().integer().min(0).max(365).required(),
  linkedInUrl: Joi.string().uri().max(500).required(),
  portfolioUrl: Joi.string().uri().allow("").max(500).optional(),
  source: Joi.string().allow("").optional(),
  jobId: Joi.string().optional(),
  employeeId: Joi.string().optional(),
  resumeUrl: Joi.forbidden(),
});
