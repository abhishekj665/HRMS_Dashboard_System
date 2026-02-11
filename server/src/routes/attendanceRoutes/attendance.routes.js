
import * as attendanceController from "../../controllers/attendance/attendance.controller.js";

import { userAuth } from "../../middlewares/auth.middleware.js";

import express from "express";

const Router = express.Router();

Router.use(userAuth);

Router.route("/in").post(attendanceController.registerInController);
Router.route("/out").put(attendanceController.registerOutController);
Router.route("/today").get(attendanceController.getTodayAttendance);

export const attendanceRouter = Router;
