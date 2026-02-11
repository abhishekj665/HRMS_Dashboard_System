import express from "express";

import * as managerUserController from "../../controllers/manager/attendance.controller.js";

const Router = express.Router();

Router.get("/attendance", managerUserController.getAttendanceData);
Router.get(
  "/attendance/approved",
  managerUserController.approvedAttendanceRequest,
);
Router.get(
  "/attendance/rejected",
  managerUserController.rejectedAttendanceRequest,
);
Router.get(
  "/attendance/pending",
  managerUserController.pendingAttendanceRequest,
);
Router.patch(
  "/attendance/approve/:id",
  managerUserController.approveAttendanceRequest,
);
Router.patch(
  "/attendance/reject/:id",
  managerUserController.rejectAttendanceRequest,
);

export const attendanceRouter = Router;
