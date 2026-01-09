import { Account } from "../../models/index.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../config/constants/Status.js";
import { generateHash } from "../../utils/generateHash.utils.js";
import { successResponse } from "../../utils/response.utils.js";
import { hash } from "bcrypt";

export const getAccountDataService = async (user) => {
  try {
    let accountData = Account.findOne({ where: { userId: user.id } });

    if (accountData) {
      return {
        success: true,
        data: accountData,
        message: "Account Data Fetched",
      };
    } else {
      return {
        success: false,
        message: "Account Data Not Fetched",
      };
    }
  } catch (error) {}
};

export const registerAccountService = async (data, user) => {
  try {
    let { email, pin } = data;
    if (!email || !pin) {
      return new ExpressError(STATUS.BAD_REQUEST, "Email and Pincode Required");
    }
    let hashPin = await generateHash(String(pin), 10);

    let account = await Account.create({
      userId: user.id,
      pin: hashPin,
      email: email,
    });

    return {
      success: true,
      message: "Account Created",
    };
  } catch (error) {
    return new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const updateAccountService = async (data, user) => {
  try {
    let { newEmail, pin } = data;

    let hashPin = await generateHash(String(pin), 10);

    const [updatedCount] = await Account.update(
      {
        pin: hashPin,
        email: newEmail,
      },
      {
        where: { userId: user.id },
      }
    );

    let accountInfo = await Account.findOne({ where: { userId: user.id } });

    if (updatedCount) {
      return {
        success: true,
        data: accountInfo,
        message: "Account Info Update",
      };
    } else {
      return {
        success: false,
        message: "Account Info Not Update",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.response);
  }
};
