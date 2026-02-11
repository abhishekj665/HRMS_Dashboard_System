import express from "express";
import * as userAssetController from "../../controllers/user/assest.controller.js";

const Router = express.Router()

Router.get("/assets", userAssetController.getAvailableAssets);

Router.route("/asset/request").post(userAssetController.createAssetRequest);
Router.route("/asset/request").get(userAssetController.getAssetRequest);

export const assetRouter = Router;