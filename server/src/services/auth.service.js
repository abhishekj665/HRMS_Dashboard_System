import { OTP, User } from "../models/Associations.model.js";
import { generateOtp } from "../config/otpService.js";
import bcrypt from "bcrypt";
import AppError from "../utils/Error.utils.js";
import { nanoid } from "nanoid";

import jwtSign from "../utils/jwt.utils.js";
import { createOTP } from "../config/otpService.js";
import { findOtpData } from "../config/otpService.js";

export const signUpService = async ({ first_name,email, password }) => {
  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required",
    };
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return {
      success: false,
      message: "User already exists",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await User.create({
    id: nanoid(),
    first_name : first_name,
    email: email,
    password: hashedPassword,
    isVerified: false,
  });

  

  const otp = generateOtp();

  await createOTP(email, otp, "SIGNUP");

  return {
    success: true,
    message: "You have to Verify your account first. OTP sent to email",
    data: user,
  };
};

export const logInService = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ExpressError(404, "User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new ExpressError(401, "Invalid Password");
  }

  if (user.isBlocked) {
    return { success: false, message: "User is blocked" };
  }

  if (!user.isVerified) {
    const otp = generateOtp();
    await createOTP(email, otp, "LOGIN");

    return {
      success: true,
      user: {
        id: user.id,
        role: user.role,
        isVerified: user.isVerified,
      },
      message: "Please verify your account",
    };
  }

  const token = jwtSign(user.id, user.role);

  user.login_At = new Date();
  await user.save();

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    token,
    message: "Login successful",
  };
};

export const verifyOtpService = async (email, otp, purpose) => {
  const otpData = await findOtpData(email, purpose);

  if (!otpData) {
    return {
      success: false,
      message: "OTP not found",
    };
  }

  if (otpData.expiresAt < new Date()) {
    return {
      success: false,
      message: "OTP expired",
    };
  }

  const valid = await bcrypt.compare(otp, otpData.otp);
  if (!valid) {
    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  otpData.isUsed = true;
  await otpData.save();

  let user = await User.findOne({
    where: {
      email,
    },
  });

  user.isVerified = true;
  await user.save();

  if (purpose === "SIGNUP") {
    await User.update({ isVerified: true }, { where: { email } });
    return { success: true, message: "Account verified successfully" };
  }

  if (purpose === "LOGIN") {
    return { success: true, message: "Login OTP verified" };
  }
};

export const logOutService = async (userId) => {
  try {
    const user = await User.findOne({ where: { id: userId }, raw: true });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      message: "User logged out successfully",
    };
  } catch (error) {
    throw new AppError(400, error.message);
  }
};
