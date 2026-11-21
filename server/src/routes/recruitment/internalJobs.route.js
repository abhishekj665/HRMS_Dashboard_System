import express from "express";
import { userAuth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";
import * as InternalJobController from "../../controllers/recruitment/internalJob.controller.js";
import { uploadResume } from "../../middlewares/upload.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { internalApplicationSchema, internalReferralSchema } from "../../validators/internalReferral.validator.js";
const Router = express.Router();

Router.get(
  "/internal/jobs",
  userAuth,
  allowRoles("manager", "employee"),
  InternalJobController.getInternalJobPosts,
);

Router.post(
  "/internal/jobs/apply/:slug",
  userAuth,
  allowRoles("manager", "employee"),
  uploadResume.single("resume"),
  validate(internalApplicationSchema),
  InternalJobController.applyToInternalJob,
);

Router.get(
  "/internal/jobs/:slug",
  userAuth,
  allowRoles("manager", "employee"),
  InternalJobController.getInternalJobPost,
);

Router.post(
  "/internal/jobs/referral/:slug",
  userAuth,
  allowRoles("manager", "employee"),
  uploadResume.single("resume"),
  validate(internalReferralSchema),
  InternalJobController.submitReferral,
);

export const InternalJobPostingRouter = Router;
