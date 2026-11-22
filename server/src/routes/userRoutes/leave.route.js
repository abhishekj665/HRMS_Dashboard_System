import express from "express";
import * as userLeaveController from "../../controllers/user/leave.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { leaveRequestSchema } from "../../validators/forms.validator.js";


const Router = express.Router();



Router.get("/lms/leave/requests",userAuth, userLeaveController.getLeaveRequests);
Router.get("/lms/leave/leave-balance",userAuth, userLeaveController.getLeaveBalance);

Router.post("/lms/leave/apply", userAuth, validate(leaveRequestSchema), userLeaveController.registerLeaveRequest);

export const userLMSRouter = Router;
