import { validate } from "../../middlewares/validate.middleware.js";
import userSchema from "../../validators/user.validator.js";
import * as userInfoController from "../../controllers/user/userInfo.controller.js";
import express from "express";
import { userAuth } from "../../middlewares/auth.middleware.js";

const Router = express.Router();

Router.route("/info/").put(validate(userSchema),userAuth, userInfoController.updateUser);
Router.route("/info/profile").get(userAuth, userInfoController.getProfile);
Router.route("/info/:id").delete(userAuth, userInfoController.deleteUser);

export const infoRouter = Router;
