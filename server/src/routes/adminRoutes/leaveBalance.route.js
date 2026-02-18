import express from "express";
import * as adminLeaveBalanceController from "../../controllers/admin/leaveBalance.controller.js";

const Router = express.Router();

Router.post(
  "/lms/leave/leave-balance/assign",
  adminLeaveBalanceController.assignLeaveBalances,
);

export const leaveBalanceRouter = Router;
