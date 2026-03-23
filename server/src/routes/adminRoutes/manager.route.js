import express from "express";

import * as adminManagerController from "../../controllers/admin/manager.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();


Router.get("/manager", adminManagerController.getAllManagersData);

Router.get("/manager/users", adminManagerController.getManagersWithUsers);
Router.post("/manager/register",refreshAuth, adminManagerController.registerManager);
Router.patch("/manager/assign", adminManagerController.assignWorkersToManager);

export const managerRouter = Router;