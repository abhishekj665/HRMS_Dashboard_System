import { OTP } from "../models/Associations.model.js";
import { generateHash } from "../utils/hash.utils.js";
import nodemailer from "nodemailer";

import { env } from "./env.js";

export const createOTP = async (email, otp, purpose) => {
  let hashedOtp = await generateHash(otp);

  await OTP.create({
    email,
    otp: hashedOtp,
    purpose: purpose,
  });

  sendMailOtp(email, otp);
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.mail_user,
    pass: env.mail_pass,
  },
});

export const sendMailOtp = async (email, otp) => {
  await transporter.sendMail({
    from: env.mail_user,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

export const findOtpData = async (email, purpose) => {
  const otpData = await OTP.findOne({
    where: {
      email,
      purpose,
      isUsed: false,
    },
    order: [["expiresAt", "DESC"]],
  });

  return otpData;
};

export const generateOtp = () => {
  let otp = Math.floor(100000 + Math.random() * 900000).toString();

  return otp;
};
