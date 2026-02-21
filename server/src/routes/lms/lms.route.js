import express from "express";
import { leaveBalanceRouter } from "./leaveBalance.route.js";
import { leaveTypeRouter } from "./leaveType.route.js";
import { leavePolicyRouter } from "./leavePolicy.route.js";


const Router = express.Router();

Router.use(leaveBalanceRouter);
Router.use(leaveTypeRouter);
Router.use(leavePolicyRouter);


export const LMSRouter = Router;