import express from "express";
import {
  logIn,
  signUp,
  verifyOtp,
  logOut,
  me,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import authSchema from "../validators/auth.validator.js";
import { userAuth } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", validate(authSchema), signUp);
authRouter.post("/login", validate(authSchema), logIn);
authRouter.post("/verify", verifyOtp);
authRouter.post("/logout", userAuth, logOut);
authRouter.get("/me", me);

export default authRouter;
