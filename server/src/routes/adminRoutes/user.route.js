import express from "express";

import * as adminUserController from "../../controllers/admin/user.controller.js";
import * as adminRequestController from "../../controllers/admin/request.controller.js";

const Router = express.Router();

Router.get("/request", adminRequestController.getRequestData);

Router.get("/users", adminUserController.getUsers);
Router.post("/user/register", adminUserController.registerUser);

Router.get("/ips", adminUserController.getIPs);
Router.put("/block", adminUserController.blockIPController);
Router.put("/unblock", adminUserController.unblockIPController);

Router.put("/block/:id", adminUserController.blockUserController);
Router.put("/unblock/:id", adminUserController.unblockUserController);

export const userRouter = Router;
