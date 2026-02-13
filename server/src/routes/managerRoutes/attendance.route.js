import express from "express";

import * as managerUserController from "../../controllers/manager/attendance.controller.js";

const Router = express.Router();

Router.get("/attendance", managerUserController.getAttendanceData);
Router.patch(
  "/attendance/approve/:id",
  managerUserController.approveAttendanceRequest,
);
Router.patch(
  "/attendance/reject/:id",
  managerUserController.rejectAttendanceRequest,
);

export const attendanceRouter = Router;
