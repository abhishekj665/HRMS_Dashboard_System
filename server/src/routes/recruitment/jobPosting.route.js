import express from "express";
import {
  adminAuth,
  managerAuth,
  refreshAuth,
  userAuth,
} from "../../middlewares/auth.middleware.js";
import * as JobPostingController from "../../controllers/recruitment/jobPosting.controller.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

const Router = express.Router();

Router.get("/jobs", JobPostingController.getJobs);
Router.get("/job/:slug", JobPostingController.getJob);

Router.use(userAuth);

Router.patch("/job-post/:id", adminAuth,refreshAuth, JobPostingController.updateJobPosting);
Router.patch(
  "/job-post/active/:id",
  adminAuth,
  refreshAuth,
  JobPostingController.activeJobPosting,
);
Router.get(
  "/job-post/:id",
  userAuth,
  refreshAuth,
  allowRoles("manager", "admin", "user"),
  JobPostingController.getJobPosting,
);
Router.get(
  "/job-posts",
  userAuth,
  refreshAuth,
  allowRoles("manager", "admin", "user"),
  JobPostingController.getJobPostings,
);

export const JobPostingRouter = Router;
