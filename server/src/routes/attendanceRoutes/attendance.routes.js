import * as attendanceController from "../../controllers/attendance/attendance.controller.js";

import { refreshAuth, userAuth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/roleAuth.middleware.js";

import express from "express";

const Router = express.Router();

Router.use(userAuth);

Router.route("/summary").get(
  allowRoles("manager", "employee", "admin"),
  attendanceController.getAttendanceSummary,
);

Router.route("/in").post(
  refreshAuth,
  userAuth,
  allowRoles("manager", "employee", "admin"),
  attendanceController.registerInController,
);
Router.route("/out").put(
  refreshAuth,
  userAuth,
  allowRoles("manager", "employee", "admin"),
  attendanceController.registerOutController,
);
Router.route("/today").get(
  allowRoles("manager", "employee", "admin"),
  attendanceController.getTodayAttendance,
);

Router.route("/by-date").get(
  allowRoles("manager", "employee", "admin"),
  attendanceController.getAttendanceByDate,
);

export const attendanceRouter = Router;
