import express from "express";
import { userAuth } from "../../middlewares/auth.middleware.js";
import * as userLeaveController from "../../controllers/user/leave.controller.js";


const Router = express.Router();

Router.use(userAuth);

Router.post("/lms/leave/register", userLeaveController.registerLeaveRequest);

export const userLMSRouter = Router;