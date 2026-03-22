import express from "express";
import { adminAuth, refreshAuth } from "../../middlewares/auth.middleware.js";

import * as HiringStageController from "../../controllers/recruitment/hiringStage.controller.js";

const Router = express.Router();

Router.patch(
  "/stage/next/:applicationId",
  adminAuth,
  refreshAuth,
  HiringStageController.moveToNextStage,
);
export const HiringStageRoute = Router;
