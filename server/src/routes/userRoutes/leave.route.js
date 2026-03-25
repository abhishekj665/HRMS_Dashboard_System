import express from "express";
import * as userLeaveController from "../../controllers/user/leave.controller.js";
import { allowRoles , userAuth} from "../../middlewares/roleAuth.middleware.js";


const Router = express.Router();



Router.get("/lms/leave/requests",userAuth, userLeaveController.getLeaveRequests);
Router.get("/lms/leave/leave-balance",userAuth, userLeaveController.getLeaveBalance);

Router.post("/lms/leave/apply",userAuth, userLeaveController.registerLeaveRequest);

export const userLMSRouter = Router;
