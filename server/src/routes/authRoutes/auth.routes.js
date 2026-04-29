import express from "express";
import {
  logIn,
  verifyOtp,
  logOut,
  me,
  getAccessToken,
  forgetPassword,
  resetPassword,
  resendOtp,
} from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import authSchema from "../../validators/auth.validator.js";
import { userAuth } from "../../middlewares/auth.middleware.js";

export const authRouter = express.Router();

// authRouter.post("/signup", validate(authSchema), signUp);
authRouter.post("/login", validate(authSchema), logIn);
authRouter.post("/verify", verifyOtp);
authRouter.post("/logout", userAuth, logOut);
authRouter.get("/me", userAuth, me);
authRouter.post("/access_token", userAuth, getAccessToken);
authRouter.post("/forgot_password", forgetPassword);
authRouter.post("/reset_password", resetPassword);
authRouter.post("/resend_otp", resendOtp);
