import express from "express";
import * as managerRequestController from "../../controllers/manager/request.controller.js";

const Router = express.Router();

Router.get("/request", managerRequestController.getRequestData);

Router.put("/request/approve/:id", managerRequestController.approveRequest);
Router.put("/request/reject/:id", managerRequestController.rejectRequest);
Router.post("/asset/request", managerRequestController.createAssetRequest);

export const requestRouter = Router;
