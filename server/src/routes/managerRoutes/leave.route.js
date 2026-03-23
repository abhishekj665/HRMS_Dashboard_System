import express from "express";
import { managerAuth, refreshAuth } from "../../middlewares/auth.middleware.js";
import * as managerLeaveRequestController from "../../controllers/manager/leave.controller.js";

const Router = express.Router();

Router.use(managerAuth);

Router.post(
  "/lms/leave/apply",
  refreshAuth,
  managerLeaveRequestController.registerLeaveRequest,
);
Router.get(
  "/lms/leave/leave-balance",
  managerLeaveRequestController.getLeaveBalance,
);
Router.get("/lms/leave/me", managerLeaveRequestController.getLeaveRequests);

export const managerLeaveRouter = Router;
