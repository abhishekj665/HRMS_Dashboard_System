import express from "express";
import { managerAuth, refreshAuth } from "../../middlewares/auth.middleware.js";
import { expenseRouter } from "./expense.route.js";
import { requestRouter } from "./request.route.js";
import { userRouter } from "./user.route.js";
import { attendanceRouter } from "./attendance.route.js";
import { assetRouter } from "./asset.route.js";
import { userLeaveRouter } from "./leaveRequest.route.js";
import { managerLeaveRouter } from "./leave.route.js";

const Router = express.Router();

Router.use(refreshAuth);

Router.use(managerAuth);

Router.use(expenseRouter);
Router.use(requestRouter);
Router.use(userRouter);
Router.use(attendanceRouter);
Router.use(assetRouter);
Router.use(assetRouter);
Router.use(userLeaveRouter);
Router.use(managerLeaveRouter);

export const managerRouter = Router;
