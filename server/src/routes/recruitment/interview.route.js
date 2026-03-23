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
  InterviewController.getInterviewers,
);

Router.post(
  "/interview/assign",
  refreshAuth,
  adminAuth,
  InterviewController.assignInterview,
);

Router.get(
  "/interview/all",
  userAuth,
  allowRoles("manager", "admin"),
  InterviewController.getInterviews,
);

Router.patch(
  "/interview/confirm/:id",
  refreshAuth,
  managerAuth,
  InterviewController.confirmInterview,
);
Router.patch(
  "/interview/decline/:id",
  refreshAuth,
  managerAuth,
  InterviewController.declineAssignedInterview,
);

Router.get(
  "/interview/active/:id",
  userAuth,
  allowRoles("manager", "admin"),
  InterviewController.getActiveInterview,
);

Router.patch(
  "/interview/reschedule/:id",
  refreshAuth,
  userAuth,
  allowRoles("manager", "admin"),
  InterviewController.rescheduleInterview,
);

export const InterviewRouter = Router;
