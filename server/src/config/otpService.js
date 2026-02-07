import { OTP } from "../models/Associations.model.js";
import { generateHash } from "../utils/hash.utils.js";
import { env } from "./env.js";
import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  env.brevo_api_key,
);

export const createOTP = async (email, otp, purpose) => {
  const hashedOtp = await generateHash(otp);

  await OTP.create({
    email,
    otp: hashedOtp,
    purpose,
  });

  sendMailOtp(email, otp).catch((err) => {
    console.error("OTP MAIL ERROR:", err.response?.body || err.message);
  });
};

export const sendMailOtp = async (email, otp) => {
  const html = `
    <h2>Your OTP is ${otp}</h2>
    <p>It expires in 5 minutes.</p>
  `;

  await sendMail(email, "OTP Verification", html);
};

export async function sendMail(to, subject, html) {
  try {
    const mail = new brevo.SendSmtpEmail();

    mail.to = [{ email: to }];
    mail.subject = subject;
    mail.htmlContent = html;
    mail.sender = {
      name: "Dashboard System",
      email: env.mail_user,
    };

    const res = await apiInstance.sendTransacEmail(mail);
    console.log("BREVO SENT:", res.body?.messageId);
    return res;
  } catch (err) {
    console.error("BREVO FAIL:", err.response?.body || err.message);
    throw err;
  }
}

export const findOtpData = async (email, purpose) => {
  return OTP.findOne({
    where: {
      email,
      purpose,
      isUsed: false,
    },
    order: [["expiresAt", "DESC"]],
  });
};

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
