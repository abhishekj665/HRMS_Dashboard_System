import express from "express";
import * as interviewFeedbackController from "../../controllers/recruitment/interviewFeedback.controller.js";
import {
  managerAuth,
  refreshAuth,
  userAuth,
} from "../../middlewares/auth.middleware.js";

const Router = express.Router();


Router.post(
  "/interview-feedback/:interviewId",
  refreshAuth,
  userAuth,
  managerAuth,
  interviewFeedbackController.createInterviewFeedback,
);

export const InterviewFeedbackRouter = Router;
