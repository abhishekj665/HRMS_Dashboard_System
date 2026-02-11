import express from "express";

import * as adminAssetController from "../../controllers/admin/asset.controller.js";

const Router = express.Router();

Router.get("/asset", adminAssetController.getAllAsset);
Router.post("/asset", adminAssetController.createAsset);
Router.delete("/asset/:id", adminAssetController.deleteAsset);
Router.put("/asset/:id", adminAssetController.updateAsset);

export const assetRouter = Router;
