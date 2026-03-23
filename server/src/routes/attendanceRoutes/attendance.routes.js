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
  allowRoles("manager", "employee", "admin"),
  attendanceController.registerInController,
);
Router.route("/out").put(
  allowRoles("manager", "employee", "admin"),
  attendanceController.registerOutController,
);
Router.route("/today").get(
  allowRoles("manager", "employee", "admin"),
  attendanceController.getTodayAttendance,
);

export const attendanceRouter = Router;
