import express from "express";
import * as adminRequestController from "../../controllers/admin/request.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";


const Router = express.Router();

Router.get("/request", adminRequestController.getRequestData);

Router.put("/request/approve/:id",refreshAuth, adminRequestController.approveRequest);
Router.put("/request/reject/:id", refreshAuth, adminRequestController.rejectRequest);

export const requestRouter = Router;