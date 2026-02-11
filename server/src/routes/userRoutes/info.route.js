import { validate } from "../../middlewares/validate.middleware.js";
import userSchema from "../../validators/user.validator.js";
import * as userInfoController from "../../controllers/user/userInfo.controller.js";
import express from "express";

const Router = express.Router();

Router.route("/").put(validate(userSchema), userInfoController.updateUser);
Router.route("/profile").get(userInfoController.getProfile);
Router.route("/:id").delete(userInfoController.deleteUser);

export const infoRouter = Router;
