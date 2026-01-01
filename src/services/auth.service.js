import { User } from "../models/index.model.js";
import { generateOtp } from "../utils/generateOtp.utils.js";
import bcrypt from "bcrypt";
import ExpressError from "../utils/Error.utils.js";
import { nanoid } from "nanoid";
import jwtSign from "../utils/jwtSign.utils.js";
import { createOTP } from "../utils/createOTP.utils.js";
import { findOtpData } from "../utils/findOtpData.utils.js";
import STATUS from "../config/constants/Status.js";
import { localTime } from "../utils/localTime.utils.js";
import { UserIP } from "../models/index.model.js";

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
    return { success: false, message: "User is blocked. Contact admin." };
  }

  let ipDetails = await UserIP.findOne({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]],
  });

  if (ipDetails.isBlocked == true) {
    throw new ExpressError(403, "Access from this IP is blocked");
  }

  if (ipDetails && ipDetails.failedLogInAttempt >= 3) {
    user.isVerified = false;
    await user.save();

    throw new ExpressError(
      403,
      "Account locked due to multiple failed login attempts"
    );
  }

  if (!user.isVerified) {
    const otp = generateOtp();

    await createOTP(email, otp, "LOGIN");
    throw new ExpressError(
      STATUS.ACCEPTED,
      "Please verify your account, opt has send to your email"
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await UserIP.increment("failedLogInAttempt", {
      where: { userId: user.id },
    });
    throw new ExpressError(401, "Invalid credentials");
  }

  const token = jwtSign(user.id, user.role);

  user.login_At = new Date();

  await user.save();

  return {
    success: true,
    id: user.id,
    role: user.role,
    token,
    message: "Login successful",
  };
};

export const verifyOtpService = async (email, otp, purpose) => {
  const otpData = await findOtpData(email, purpose);

  if (!otpData) {
    throw new ExpressError(400, "OTP not found");
  }

  if (otpData.expiresAt < new Date()) {
    throw new ExpressError(400, "OTP expired");
  }

  const valid = await bcrypt.compare(otp, otpData.otp);
  if (!valid) {
    throw new ExpressError(400, "Invalid OTP");
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

  let ipDetails = await UserIP.findOne({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]],
  });
  if (ipDetails) {
    ipDetails.failedLogInAttempt = 0;
    await ipDetails.save();
  }

  if (purpose === "SIGNUP") {
    await User.update({ isVerified: true }, { where: { email } });
    return { success: true, message: "Account verified successfully" };
  }

  if (purpose === "LOGIN") {
    return { success: true, message: "Login OTP verified" };
  }
};
