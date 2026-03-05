import express from "express";
import { adminAuth } from "../../middlewares/auth.middleware.js";

import * as HiringStageController from "../../controllers/recruitment/hiringStage.controller.js";

const Router = express.Router();

Router.patch(
  "/stage/next/:applicationId",
  adminAuth,
  HiringStageController.moveToNextStage,
);
export const HiringStageRoute = Router;
