import express from "express";
import { managerAuth } from "../middlewares/auth.middleware.js";

import * as managerUserController from "../controllers/manager/user.controller.js";
import * as managerRequestController from "../controllers/manager/request.controller.js";
import * as managerExpenseController from "../controllers/manager/expense.controller.js";
import * as managerAssetController from "../controllers/manager/asset.controller.js";

const Router = express.Router();

Router.use(managerAuth);

Router.get("/users", managerUserController.getUsers);

Router.get("/request", managerRequestController.getRequestData);

Router.post("/user/register", managerUserController.registerUser);

Router.put("/request/approve/:id", managerRequestController.approveRequest);
Router.put("/request/reject/:id", managerRequestController.rejectRequest);
Router.post("/asset/request", managerRequestController.createAssetRequest);

Router.get("/asset", managerAssetController.getAllAsset);
Router.get("/assets", managerAssetController.getAvailableAssets);


Router.get("/expense", managerExpenseController.getAllExpense);
Router.put(
  "/expense/approve/:id",
  managerExpenseController.approveExpenseRequest
);
Router.put(
  "/expense/reject/:id",
  managerExpenseController.rejectExpenseRequest
);

Router.get("", (req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

export const managerRouter = Router;
