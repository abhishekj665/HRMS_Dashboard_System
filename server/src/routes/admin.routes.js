import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/adminAuth.middleware.js";

const Router = express.Router();

import * as adminUserController from "../controllers/admin/user.controller.js";
import * as adminRequestController from "../controllers/admin/request.controller.js";
import * as adminAssetController from "../controllers/admin/asset.controller.js";
import * as adminExpenseController from "../controllers/admin/expenses.controller.js";

Router.use(auth);

Router.get("/request", adminRequestController.getRequestData);

Router.use(adminAuth);

Router.get("/users", adminUserController.getUsers);

Router.put("/block", adminUserController.blockIPController);
Router.put("/unblock", adminUserController.unblockIPController);

Router.put("/block/:id", adminUserController.blockUserController);
Router.put("/unblock/:id", adminUserController.unblockUserController);

Router.put("/request/approve/:id", adminRequestController.approveRequest);
Router.put("/request/reject/:id", adminRequestController.rejectRequest);

Router.get("/asset", adminAssetController.getAllAsset);
Router.post("/asset", adminAssetController.createAsset);
Router.delete("/asset/:id", adminAssetController.deleteAsset);
Router.put("/asset/:id", adminAssetController.updateAsset);

Router.get("/expense", adminExpenseController.getAllExpense);
Router.put("/expense/approve/:id", adminExpenseController.approveExpenseRequest)
Router.put("/expense/reject/:id", adminExpenseController.rejectExpenseRequest)

Router.get("", (req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

export const adminRouter = Router;
