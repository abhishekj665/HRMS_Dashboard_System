import express from "express";

import * as userAttendanceController from "../../controllers/user/attendance.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/attendance", userAuth,userAttendanceController.getAttendanceData);
Router.get("/attendance/pending", userAuth, userAttendanceController.pendingAttendanceRequest);
Router.get("/attendance/rejected", userAuth, userAttendanceController.rejectedAttendanceRequest);
Router.get("/attendance/approved", userAuth, userAttendanceController.approvedAttendanceRequest);

export const attendanceRouter = Router;
