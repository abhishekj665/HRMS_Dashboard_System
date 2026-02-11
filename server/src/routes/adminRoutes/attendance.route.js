import express from "express";
import { adminAuth } from "../../middlewares/auth.middleware.js";
import * as attendanceController from "../../controllers/admin/attendance.controller.js";

const Router = express.Router();

Router.get("/attendance/user", attendanceController.getUserAttendanceData);
Router.get(
  "/attendance/user/approved",
  attendanceController.approvedUserAttendanceRequest,
);
Router.get(
  "/attendance/user/rejected",
  attendanceController.rejectedUserAttendanceRequest,
);
Router.get(
  "/attendance/user/pending",
  attendanceController.pendingUserAttendanceRequest,
);
Router.get(
  "/attendance/manager",
  attendanceController.getManagerAttendanceData,
);
Router.get(
  "/attendance/manager/approved",
  attendanceController.approvedManagerAttendanceRequest,
);
Router.get(
  "/attendance/manager/rejected",
  attendanceController.rejectedManagerAttendanceRequest,
);
Router.get(
  "/attendance/manager/pending",
  attendanceController.pendingManagerAttendanceRequest,
);
Router.patch(
  "/attendance/approve/:id",
  attendanceController.approveAttendanceRequest,
);
Router.patch(
  "/attendance/reject/:id",
  attendanceController.rejectAttendanceRequest,
);

export const attendanceRouter = Router;
