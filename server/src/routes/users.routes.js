import express from "express";
import * as userAssetController from "../controllers/user/assest.controller.js"
import * as userInfoController from "../controllers/user/userInfo.controller.js"
import { userAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import userSchema from "../validators/user.validator.js";

export const userRouter = express.Router();

userRouter.use(userAuth);


userRouter.route("/").put(validate(userSchema), userInfoController.updateUser);
userRouter.route("/profile").get(userInfoController.getProfile);
userRouter.get("/assets", userAssetController.getAvailableAssets);


userRouter.route("/asset/request").post(userAssetController.createAssetRequest);
userRouter.route("/asset/request").get(userAssetController.getAssetRequest);
userRouter.route("/:id").delete(userInfoController.deleteUser);
