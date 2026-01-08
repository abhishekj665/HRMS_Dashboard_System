import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/adminAuth.middleware.js";

const Router = express.Router();

import {
  blockUserController,
  unblockUserController,
  blockIPController,
  unblockIPController,
  getRequestData,
  approveRequest,
  rejectRequest,
  createAsset,
  getAllAsset,
  deleteAsset,
  updateAsset,
} from "../controllers/admin.controller.js";

Router.use(auth);

Router.get("/request", getRequestData);

Router.use(adminAuth);

Router.put("/block", blockIPController);
Router.put("/unblock", unblockIPController);

Router.put("/block/:id", blockUserController);
Router.put("/unblock/:id", unblockUserController);

Router.put("/request/approve/:id", approveRequest);
Router.put("/request/reject/:id", rejectRequest);

Router.get("/asset", getAllAsset);
Router.post("/asset", createAsset);
Router.delete("/asset/:id", deleteAsset);
Router.put("/asset/:id", updateAsset);

Router.get("", (req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

export const adminRouter = Router;
