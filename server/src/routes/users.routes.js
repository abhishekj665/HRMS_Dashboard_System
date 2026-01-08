import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  getProfile,
  createAssetRequest,
  getAssetRequest,
  getAvailableAssets
} from "../controllers/users.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import userSchema from "../validators/user.validator.js";

export const userRouter = express.Router();

userRouter.use(auth);


userRouter.route("/").get(getUsers).put(validate(userSchema), updateUser);
userRouter.route("/profile").get(getProfile);
userRouter.get("/assets", getAvailableAssets);


userRouter.route("/asset/request").post(createAssetRequest);
userRouter.route("/asset/request").get(getAssetRequest);
userRouter.route("/:id").delete(deleteUser);
