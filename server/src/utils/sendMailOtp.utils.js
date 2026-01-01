import { transporter } from "./mailer.utils.js";
import { env } from "../config/env.js";

export const sendMailOtp = async (email, otp) => {
  await transporter.sendMail({
    from: env.mail_user,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};
