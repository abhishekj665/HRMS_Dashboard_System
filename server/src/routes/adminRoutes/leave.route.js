import express from "express";
import * as adminLeaveController from "../../controllers/admin/leave.controller.js";

const Router = express.Router();

Router.post(
  "/lms/leave/leave-type/register",
  adminLeaveController.registerLeaveType,
);



export const leaveRouter = Router;
