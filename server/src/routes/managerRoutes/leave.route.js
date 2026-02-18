import express from "express";
import { managerAuth } from "../../middlewares/auth.middleware.js";
import * as managerLeaveController from "../../controllers/manager/leave.controller.js";

const Router = express.Router();

Router.use(managerAuth);

Router.patch("/lms/leave/approve/:id", managerLeaveController.approveLeaveRequest);

export const LMSRouter = Router;
