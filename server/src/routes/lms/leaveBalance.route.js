import express from "express";
import * as  leaveBalanceController from "../../controllers/admin/leaveBalance.controller.js";
import { adminAuth, refreshAuth } from "../../middlewares/auth.middleware.js";




const Router = express.Router();


Router.put(
  "/leave/leave-balance/assign/:id",refreshAuth, adminAuth,
  leaveBalanceController.assignLeaveBalance,
);
Router.put(
  "/leave/leave-balance/assign-bulk/:id",refreshAuth, adminAuth,
  leaveBalanceController.assignLeaveBalanceBulk,
)

export const leaveBalanceRouter = Router;
