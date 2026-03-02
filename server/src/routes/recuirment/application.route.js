import express from "express";
import { uploadResume } from "../../middlewares/upload.js";
import * as ApplicationController from "../../controllers/recruitment/application.controller.js";

const Router = express.Router();

Router.post(
  "/application/apply/:slug",
  uploadResume.single("resume"),
  ApplicationController.registerApplication,
);

Router.get("/application/all", ApplicationController.getApplications);
Router.get("/application/:id", ApplicationController.getApplicationById);
Router.patch("/application/shortlist/:id", ApplicationController.shortlistApplication);
Router.patch("/application/reject/:id", ApplicationController.rejectApplication);

export const ApplicationRouter = Router;
