import express from "express";
import * as adminRequestController from "../../controllers/admin/request.controller.js";


const Router = express.Router();

Router.get("/request", adminRequestController.getRequestData);

Router.put("/request/approve/:id", adminRequestController.approveRequest);
Router.put("/request/reject/:id", adminRequestController.rejectRequest);

export const requestRouter = Router;