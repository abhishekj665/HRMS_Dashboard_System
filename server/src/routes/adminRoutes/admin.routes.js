import express from "express";
import { adminAuth } from "../../middlewares/auth.middleware.js";
import { assetRouter } from "./asset.route.js";
import { requestRouter } from "./request.route.js";
import { attendanceRouter } from "./attendance.route.js";
import { expenseRouter } from "./expense.route.js";
import { managerRouter } from "./manager.route.js";
import { userRouter } from "./user.route.js";
import { leaveRouter } from "./leave.route.js";
import { policyRouter } from "./leavePolicy.route.js";

const Router = express.Router();

Router.use(adminAuth);
Router.use(assetRouter);
Router.use(requestRouter);
Router.use(attendanceRouter);
Router.use(expenseRouter);
Router.use(managerRouter);
Router.use(userRouter);
Router.use(leaveRouter);
Router.use(policyRouter);


Router.get("", (req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

export const adminRouter = Router;
