import { OTP } from "../models/index.model.js";
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
