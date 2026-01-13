import { User } from "../models/Associations.model.js";
import { generateOtp } from "../config/otpService.js";
import bcrypt from "bcrypt";
import ExpressError from "../utils/Error.utils.js";
import { nanoid } from "nanoid";
import jwtSign from "../utils/jwtutils.js";
import { createOTP } from "../config/otpService.js";
import { findOtpData } from "../config/otpService.js";

export const signUpService = async ({ email, password }) => {
  if (!email || !password) {
    throw new ExpressError(400, "Email and password required");
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    throw new ExpressError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    id: nanoid(),
    email,
    password: hashedPassword,
    isVerified: false,
  });

  const otp = generateOtp();

  createOTP(email, otp, "SIGNUP");

  return {
    success: true,
    message: "You have to Verify your account first. OTP sent to email",
  };
};

export const logInService = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ExpressError(404, "User not found");
  }

  if (user.isBlocked) {
    return { success: false, message: "User is blocked" };
  }

  if (!user.isVerified) {
    const otp = generateOtp();
    await createOTP(email, otp, "LOGIN");

    return {
      success: false,
      message: "Please verify your account",
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new ExpressError(401, "Invalid Password");
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
  if (!otpData) throw new ExpressError(400, "OTP not found");

  if (otpData.expiresAt < new Date()) {
    throw new ExpressError(400, "OTP expired");
  }

  const valid = await bcrypt.compare(otp, otpData.otp);
  if (!valid) throw new ExpressError(400, "Invalid OTP");

  otpData.isUsed = true;
  await otpData.save();

  const user = await User.findOne({ where: { email } });
  if (!user) throw new ExpressError(404, "User not found");

  user.isVerified = true;
  user.login_At = new Date();
  await user.save();

  const token = jwtSign(user.id, user.role);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    token,
  };
};
