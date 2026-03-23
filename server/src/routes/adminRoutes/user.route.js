import express from "express";

import * as adminUserController from "../../controllers/admin/user.controller.js";
import * as adminRequestController from "../../controllers/admin/request.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/request", adminRequestController.getRequestData);

Router.get("/users", adminUserController.getUsers);
Router.post("/user/register",refreshAuth, adminUserController.registerUser);

Router.get("/ips", adminUserController.getIPs);
Router.put("/block",refreshAuth, adminUserController.blockIPController);
Router.put("/unblock", refreshAuth, adminUserController.unblockIPController);

Router.put("/block/:id", refreshAuth, adminUserController.blockUserController);
Router.put("/unblock/:id", refreshAuth, adminUserController.unblockUserController);

export const userRouter = Router;
