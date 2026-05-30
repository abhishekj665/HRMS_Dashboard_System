import express from "express";
import { userAuth } from "../../middlewares/auth.middleware.js";
import { expenseRouter } from "./expense.route.js";
import { infoRouter } from "./info.route.js";
import { attendanceRouter } from "./attendance.route.js";
import { assetRouter } from "./asset.route.js";
import { userLMSRouter } from "./leave.route.js";
import { profileRouter } from "../profile/profile.route.js";

const Router = express.Router();

Router.use(userAuth);
Router.use(infoRouter);
Router.use(expenseRouter);
Router.use(attendanceRouter);
Router.use(assetRouter);
Router.use(userLMSRouter);
Router.use(profileRouter);


export const userRouter = Router;
