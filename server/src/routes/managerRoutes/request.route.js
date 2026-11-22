import express from "express";
import * as managerRequestController from "../../controllers/manager/request.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { assetRequestSchema, remarkSchema } from "../../validators/forms.validator.js";
const Router = express.Router();

Router.get("/request", managerRequestController.getRequestData);

Router.put("/request/approve/:id", managerRequestController.approveRequest);
Router.put("/request/reject/:id", validate(remarkSchema), managerRequestController.rejectRequest);
Router.post("/asset/request", refreshAuth, validate(assetRequestSchema), managerRequestController.createAssetRequest);

export const requestRouter = Router;
