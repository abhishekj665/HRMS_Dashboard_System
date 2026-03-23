import express from "express";
import * as managerRequestController from "../../controllers/manager/request.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";
const Router = express.Router();

Router.get("/request", managerRequestController.getRequestData);

Router.put("/request/approve/:id", managerRequestController.approveRequest);
Router.put("/request/reject/:id", managerRequestController.rejectRequest);
Router.post("/asset/request", refreshAuth, managerRequestController.createAssetRequest);

export const requestRouter = Router;
