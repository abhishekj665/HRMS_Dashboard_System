import express from "express";
import { managerAuth, refreshAuth, userAuth } from "../../middlewares/auth.middleware.js";
import * as managerLeaveRequestController from "../../controllers/manager/leave.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { leaveRequestSchema } from "../../validators/forms.validator.js";

const Router = express.Router();

Router.use(managerAuth);

Router.post(
  "/lms/leave/apply",
  refreshAuth,
  userAuth,
  validate(leaveRequestSchema),
  managerLeaveRequestController.registerLeaveRequest,
);
Router.get(
  "/lms/leave/leave-balance",
  managerLeaveRequestController.getLeaveBalance,
);
Router.get("/lms/leave/me", managerLeaveRequestController.getLeaveRequests);

export const managerLeaveRouter = Router;
