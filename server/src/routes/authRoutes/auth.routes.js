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
import { authRateLimiter } from "../../middlewares/rateLimit.middleware.js";

export const authRouter = express.Router();

authRouter.post("/login", authRateLimiter, validate(authSchema), logIn);
authRouter.post("/verify", authRateLimiter, verifyOtp);
authRouter.post("/logout", userAuth, logOut);
authRouter.get("/me", userAuth, me);
authRouter.post("/access_token", userAuth, getAccessToken);
authRouter.post("/forgot_password", authRateLimiter, forgetPassword);
authRouter.post("/reset_password", authRateLimiter, resetPassword);
authRouter.post("/resend_otp", authRateLimiter, resendOtp);
