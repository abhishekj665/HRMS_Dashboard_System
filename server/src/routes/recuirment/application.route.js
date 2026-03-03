import express from "express";
import { uploadResume } from "../../middlewares/upload.js";
import * as ApplicationController from "../../controllers/recruitment/application.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

const Router = express.Router();

Router.post(
  "/application/apply/:slug",
  uploadResume.single("resume"),
  ApplicationController.registerApplication,
);

Router.get("/application/all", userAuth, allowRoles("manager", "admin"), ApplicationController.getApplications);
Router.get("/application/:id",userAuth, allowRoles("manager", "admin"),ApplicationController.getApplicationById);
Router.patch("/application/shortlist/:id",userAuth, allowRoles("manager", "admin"),ApplicationController.shortlistApplication
);
Router.patch("/application/reject/:id",userAuth, allowRoles("manager", "admin"),ApplicationController.rejectApplication);

export const ApplicationRouter = Router;
