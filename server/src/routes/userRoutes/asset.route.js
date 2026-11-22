import express from "express";
import * as userAssetController from "../../controllers/user/assest.controller.js";
import { userAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { assetRequestSchema } from "../../validators/forms.validator.js";

const Router = express.Router();

Router.get("/assets", userAuth, userAssetController.getAvailableAssets);

Router.route("/asset/request").post(
  userAuth,
  validate(assetRequestSchema),
  userAssetController.createAssetRequest,
);
Router.route("/asset/request").get(
  userAuth,
  userAssetController.getAssetRequest,
);

export const assetRouter = Router;
