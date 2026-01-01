import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/adminAuth.middleware.js";

const Router = express.Router();

import {
  blockUserController,
  unblockUserController,
  blockIPController,
  unblockIPController,
} from "../controllers/admin.controller.js";

Router.use(auth);
Router.use(adminAuth);

Router.put("/block", blockIPController);
Router.put("/unblock", unblockIPController);

Router.put("/block/:id", blockUserController);
Router.put("/unblock/:id", unblockUserController);

Router.get("", (req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

export const adminRouter = Router;
