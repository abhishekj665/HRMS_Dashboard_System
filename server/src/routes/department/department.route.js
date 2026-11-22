import {
  adminAuth,
  userAuth,
  refreshAuth,
} from "../../middlewares/auth.middleware.js";
import { isSubscribed } from "../../middlewares/subscription.middleware.js";
import * as departmentController from "../../controllers/department/department.controller.js";

import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { departmentSchema } from "../../validators/forms.validator.js";

const Router = express.Router();

Router.post(
  "/",
  refreshAuth,
  adminAuth,
  isSubscribed,
  validate(departmentSchema),
  departmentController.registerDepartment,
);
Router.get("/",userAuth, departmentController.getDepartments);
Router.get(
  "/:id",
  refreshAuth,
  adminAuth,
  isSubscribed,
  departmentController.getDepartmentById,
);

export const DepartmentRouter = Router;
