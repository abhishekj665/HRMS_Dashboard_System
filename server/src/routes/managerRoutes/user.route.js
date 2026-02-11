import express from "express";
import { managerAuth } from "../../middlewares/auth.middleware.js";

import * as managerUserController from "../../controllers/manager/user.controller.js";

const Router = express.Router();

Router.get("/users", managerUserController.getUsers);
Router.post("/user/register", managerUserController.registerUser);

export const userRouter = Router;
