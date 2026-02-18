import express from "express";
import { userAuth } from "../../middlewares/auth.middleware.js";
import { expenseRouter } from "./expense.route.js";
import { infoRouter } from "./info.route.js";
import { attendanceRouter } from "./attendance.route.js";
import { assetRouter } from "./asset.route.js";
import { userLMSRouter } from "./leave.route.js";

const Router = express.Router();

Router.use(userAuth);
Router.use(expenseRouter);
Router.use(infoRouter);
Router.use(attendanceRouter);
Router.use(assetRouter);
Router.use(userLMSRouter);


export const userRouter = Router;
