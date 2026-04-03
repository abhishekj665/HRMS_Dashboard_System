import express from "express";
import * as userAssetController from "../../controllers/user/assest.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/assets", userAuth, userAssetController.getAvailableAssets);

Router.route("/asset/request").post(
  userAuth,
  userAssetController.createAssetRequest,
);
Router.route("/asset/request").get(
  userAuth,
  userAssetController.getAssetRequest,
);

export const assetRouter = Router;
