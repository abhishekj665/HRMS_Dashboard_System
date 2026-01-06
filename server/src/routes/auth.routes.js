import express from "express";
import {
  logIn,
  signUp,
  verifyOtp,
  logOut,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import authSchema from "../validators/auth.validator.js";
import { auth } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", validate(authSchema), signUp);
authRouter.post("/login", validate(authSchema), logIn);
authRouter.post("/verify", verifyOtp);
authRouter.post("/logout", auth, logOut);

export default authRouter;
