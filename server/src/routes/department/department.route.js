import {
  adminAuth,
  userAuth,
  refreshAuth,
} from "../../middlewares/auth.middleware.js";
import * as departmentController from "../../controllers/department/department.controller.js";

import express from "express";

const Router = express.Router();

Router.post(
  "/",
  refreshAuth,
  adminAuth,
  departmentController.registerDepartment,
);
Router.get("/",userAuth, departmentController.getDepartments);
Router.get(
  "/:id",
  refreshAuth,
  adminAuth,
  departmentController.getDepartmentById,
);

export const DepartmentRouter = Router;
