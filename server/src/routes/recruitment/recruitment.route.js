import express from "express";
import { JobRequistionRouter } from "./jobRequisition.route.js";
import { JobPostingRouter } from "./jobPosting.route.js";
import { ApplicationRouter } from "./application.route.js";
import { CandidateRouter } from "./candidate.route.js";
import { InterviewRouter } from "./interview.route.js";
import { InterviewFeedbackRouter } from "./interviewFeedback.route.js";
import { HiringStageRoute } from "./hiringStage.route.js";
import { OfferRoute } from "./offer.route.js";

const Router = express.Router();

Router.use(JobRequistionRouter);
Router.use(JobPostingRouter);
Router.use(ApplicationRouter);
Router.use(CandidateRouter);
Router.use(InterviewRouter);
Router.use(InterviewFeedbackRouter);
Router.use(HiringStageRoute)
Router.use(OfferRoute);

export const RecruitmentRouter = Router;
