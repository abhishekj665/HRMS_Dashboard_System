import { Account } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { generateHash } from "../../utils/hash.utils.js";
import { getScopedWhere, requireTenantId } from "../../utils/tenant.utils.js";

export const getAccountDataService = async (user) => {
  try {
    let accountData = await Account.findOne({
      where: getScopedWhere(user, { userId: user.id }),
    });

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
    const tenantId = requireTenantId(user);
    let { email, pin } = data;
    if (!email || !pin) {
      return new ExpressError(STATUS.BAD_REQUEST, "Email and Pincode Required");
    }
    let hashPin = await generateHash(String(pin), 10);

    const lastAccount = await Account.findOne({
      where: { tenantId },
      order: [["createdAt", "DESC"]],
    });

    const accountNumber = lastAccount ? lastAccount.accountNumber + 1 : 1;

    

    let account = await Account.create({
      userId: user.id,
      tenantId,
      accountNumber: accountNumber,
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
    const tenantId = requireTenantId(user);
    let { newEmail, pin } = data;

    let hashPin = await generateHash(String(pin), 10);

    const [updatedCount] = await Account.update(
      {
        pin: hashPin,
        email: newEmail,
      },
      {
        where: { userId: user.id, tenantId },
      },
    );

    let accountInfo = await Account.findOne({
      where: { userId: user.id, tenantId },
    });

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
