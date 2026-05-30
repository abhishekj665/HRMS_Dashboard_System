import express from "express";
import { userAuth } from "../../middlewares/auth.middleware.js";
import * as profileController from "../../controllers/profile/profile.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import profileSchema from "../../validators/profile.validator.js";
import { uploadOrganizationDocs } from "../../middlewares/upload.js";

const Router = express.Router();

Router.route("/profile")
  .get(userAuth, profileController.getProfile)
  .put(userAuth, validate(profileSchema), profileController.upsertProfile);

Router.route("/profile/documents").put(
  userAuth,
  uploadOrganizationDocs.fields([
    { name: "profileFile", maxCount: 1 },
    { name: "adharFile", maxCount: 1 },
    { name: "panCardFile", maxCount: 1 },
  ]),
  profileController.uploadProfileDocuments,
);

export const profileRouter = Router;
