import { User } from "../models/index.model.js";
import ExpressError from "../utils/Error.utils.js";
import { UserIP } from "../models/index.model.js";

export const blockUserService = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.role === "admin") {
      return { success: false, message: "Cannot block an admin user" };
    }
    user.isBlocked = true;
    await user.save();
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockUserService = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    user.isBlocked = false;
    await user.save();
    return { success: true, message: "User unblocked successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const blockIPService = async (ip) => {
  try {
    const [updatedCount] = await UserIP.update(
      { isBlocked: true },
      { where: { ipAddress: ip } }
    );

    if (updatedCount === 0) {
      throw new ExpressError(404, "IP address not found");
    }

    return {
      success: true,
      message: `IP ${ip} blocked successfully for all users`,
    };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockIPService = async (ip) => {
  try {
    const [updatedCount] = await UserIP.update(
      { isBlocked: false },
      { where: { ipAddress: ip } }
    );

    if (updatedCount === 0) {
      throw new ExpressError(404, "IP address not found");
    }
    return { success: true, message: `IP ${ip} unblocked successfully` };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};
