import * as attendancePolicyController from "../../controllers/attendance/attendancePolicy.controller.js";
import express from "express";
import { adminAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.use(adminAuth);

Router.post("/", attendancePolicyController.createAttendancePolicy);
Router.get("/", attendancePolicyController.getAttendancePolicies);
Router.put("/:id", attendancePolicyController.updateAttendancePolicy);
Router.delete("/:id", attendancePolicyController.deleteAttendancePolicy);

export const attendancePolicyRouter = Router;
