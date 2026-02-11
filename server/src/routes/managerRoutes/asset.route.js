import express from "express";
import * as managerAssetController from "../../controllers/manager/asset.controller.js";

const Router = express.Router();

Router.get("/asset", managerAssetController.getAllAsset);
Router.get("/assets", managerAssetController.getAvailableAssets);

export const assetRouter = Router;
