import express from "express";

import * as adminAssetController from "../../controllers/admin/asset.controller.js";
import { refreshAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/asset", adminAssetController.getAllAsset);
Router.post("/asset",refreshAuth, adminAssetController.createAsset);
Router.delete("/asset/:id",refreshAuth, adminAssetController.deleteAsset);
Router.put("/asset/:id",refreshAuth, adminAssetController.updateAsset);

export const assetRouter = Router;
