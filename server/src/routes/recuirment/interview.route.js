import express from "express";
import {
  adminAuth,
  managerAuth,
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
  managerAuth,
  InterviewController.confirmInterview,
);
Router.patch(
  "/interview/decline/:id",
  managerAuth,
  InterviewController.declineAssignedInterview,
);

Router.get("/interview/active/:id",userAuth, allowRoles("manager", "admin"), InterviewController.getActiveInterview)

Router.patch(
  "/interview/reschedule/:id",
  userAuth, allowRoles("manager", "admin"),
  InterviewController.rescheduleInterview,
);


export const InterviewRouter = Router;
