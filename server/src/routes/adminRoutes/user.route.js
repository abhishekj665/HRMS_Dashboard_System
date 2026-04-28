import express from "express";

import * as adminUserController from "../../controllers/admin/user.controller.js";
import * as adminRequestController from "../../controllers/admin/request.controller.js";
import { refreshAuth, userAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/request", adminRequestController.getRequestData);

Router.get("/users", adminUserController.getUsers);
Router.post(
  "/user/register",
  refreshAuth,
  userAuth,
  adminUserController.registerUser,
);

Router.get("/ips", adminUserController.getIPs);
Router.put(
  "/block",
  refreshAuth,
  userAuth,
  adminUserController.blockIPController,
);
Router.put(
  "/unblock",
  refreshAuth,
  userAuth,
  adminUserController.unblockIPController,
);

Router.put(
  "/block/:id",
  refreshAuth,
  userAuth,
  adminUserController.blockUserController,
);
Router.put(
  "/unblock/:id",
  refreshAuth,
  userAuth,
  adminUserController.unblockUserController,
);

export const userRouter = Router;
