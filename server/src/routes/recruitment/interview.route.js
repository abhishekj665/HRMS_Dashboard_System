import express from "express";
import {
  adminAuth,
  managerAuth,
  refreshAuth,
  userAuth,
} from "../../middlewares/auth.middleware.js";
import * as InterviewController from "../../controllers/recruitment/interview.controller.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

const Router = express.Router();

Router.get(
  "/interview/interviewers",
  adminAuth,
  refreshAuth,
  InterviewController.getInterviewers,
);

Router.post(
  "/interview/assign",
  adminAuth,
  refreshAuth,
  InterviewController.assignInterview,
);

Router.get(
  "/interview/all",
  userAuth,
  refreshAuth,
  allowRoles("manager", "admin"),
  InterviewController.getInterviews,
);

Router.patch(
  "/interview/confirm/:id",
  managerAuth,
  refreshAuth,
  InterviewController.confirmInterview,
);
Router.patch(
  "/interview/decline/:id",
  managerAuth,
  refreshAuth,
  InterviewController.declineAssignedInterview,
);

Router.get(
  "/interview/active/:id",
  userAuth,
  refreshAuth,
  allowRoles("manager", "admin"),
  InterviewController.getActiveInterview,
);

Router.patch(
  "/interview/reschedule/:id",
  userAuth,
  refreshAuth,
  allowRoles("manager", "admin"),
  InterviewController.rescheduleInterview,
);

export const InterviewRouter = Router;
