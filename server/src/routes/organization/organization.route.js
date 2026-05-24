import express from "express";
import * as organizationController from "../../controllers/organization/organization.controller.js";
import { uploadOrganizationDocs } from "../../middlewares/upload.js";

const Router = express.Router();

Router.post(
  "/register",
  uploadOrganizationDocs.fields([
    { name: "gstFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "logoFile", maxCount: 1 },
  ]),
  organizationController.registerOrganization,
);

export const OrganizationRouter = Router;
