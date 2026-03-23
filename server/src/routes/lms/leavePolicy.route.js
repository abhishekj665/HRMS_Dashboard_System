import express from "express";
import * as leavePolicyController from "../../controllers/admin/leavePolicy.controller.js";
import {
  adminAuth,
  refreshAuth,
  userAuth,
} from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

const Router = express.Router();

Router.get(
  "/policy/all",
  userAuth,
  allowRoles("manager", "admin", "employee"),
  leavePolicyController.getLeavePolicies,
);

Router.post(
  "/policy/register",
  refreshAuth,
  adminAuth,
  leavePolicyController.registerLeavePolicy,
);
Router.put(
  "/policy/update/:id",
  refreshAuth,
  adminAuth,
  leavePolicyController.updateLeavePolicy,
);
Router.patch(
  "/policy/assign/:id",
  refreshAuth,
  adminAuth,
  leavePolicyController.assignPolicyToUser,
);
Router.patch(
  "/policy/assign-bulk/:id",
  refreshAuth,
  adminAuth,
  leavePolicyController.assignPolicyBulk,
);
Router.delete(
  "/policy/delete/:id",
  refreshAuth,
  adminAuth,
  leavePolicyController.deleteLeavePolicy,
);

export const leavePolicyRouter = Router;
