import express from "express";

import * as userAttendanceController from "../../controllers/user/attendance.controller.js";

const Router = express.Router();

Router.get("/attendance", userAttendanceController.getAttendanceData);
Router.get("/attendance/pending", userAttendanceController.pendingAttendanceRequest);
Router.get("/attendance/rejected", userAttendanceController.rejectedAttendanceRequest);
Router.get("/attendance/approved", userAttendanceController.approvedAttendanceRequest);

export const attendanceRouter = Router;
