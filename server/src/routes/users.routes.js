import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  getProfile,
} from "../controllers/users.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import userSchema from "../validators/user.validator.js";

export const userRouter = express.Router();

userRouter.use(auth);
// 1st
userRouter.route("/").get(getUsers).put(validate(userSchema), updateUser);
userRouter.route("/profile").get(getProfile);
userRouter.route("/:id").delete(deleteUser);
