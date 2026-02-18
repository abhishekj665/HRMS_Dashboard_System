import express from "express";
import * as leavePolicyController from "../../controllers/admin/leavePolicy.controller.js";


const Router = express.Router();

Router.post("/lms/policy/register", leavePolicyController.registerLeavePolicy);
Router.put("/lms/policy/update/:id", leavePolicyController.updateLeavePolicy);
Router.delete("/lms/policy/delete/:id", leavePolicyController.deleteLeavePolicy);
Router.get("/lms/policy/get", leavePolicyController.getLeavePolicies);

export const policyRouter = Router;