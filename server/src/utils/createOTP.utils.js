import { OTP } from "../models/index.model.js";
import { sendMailOtp } from "./sendMailOtp.utils.js";
import { generateHash } from "./generateHash.utils.js";

export const createOTP = async (email, otp, purpose) => {
  let hashedOtp = await generateHash(otp);

  await OTP.create({
    email,
    otp: hashedOtp,
    purpose: purpose,
  });

  sendMailOtp(email, otp);
};
