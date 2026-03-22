import express from "express";
import {
  adminAuth,
  managerAuth,
  refreshAuth,
  userAuth,
} from "../../middlewares/auth.middleware.js";
import * as JobRequistionController from "../../controllers/recruitment/jobRequisition.controller.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

const Router = express.Router();

Router.post(
  "/job-requisition",
  managerAuth,
  refreshAuth,
  JobRequistionController.registerJobRequisition,
);
Router.get(
  "/job-requisitions",
  userAuth,
  refreshAuth,
  allowRoles("admin", "manager"),
  JobRequistionController.getJobRequisitions,
);
Router.get(
  "/job-requisition/:id",
  userAuth,
  refreshAuth,
  allowRoles("admin", "manager"),
  JobRequistionController.getJobRequisition,
);
Router.put(
  "/job-requisition/:id",
  managerAuth,
  refreshAuth,
  JobRequistionController.updateJobRequisition,
);
Router.patch(
  "/job-requisition/approve/:id",
  adminAuth,
  refreshAuth,
  JobRequistionController.approveJobRequisition,
);
Router.patch(
  "/job-requisition/reject/:id",
  adminAuth,
  refreshAuth,
  JobRequistionController.rejectJobRequisition,
);

export const JobRequistionRouter = Router;
