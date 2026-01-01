import { User } from "../models/index.model.js";
import ExpressError from "../utils/Error.utils.js";
import { UserIP } from "../models/index.model.js";

export const blockUserService = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if(user.role === 'admin'){
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
    let ipDetails = await UserIP.findOne({ where: { ipAddress: ip } });

    if (!ipDetails) {
      throw new ExpressError(404, "IP address not found");
    }

    ipDetails.isBlocked = true;
    await ipDetails.save();

    return { success: true, message: `IP ${ip} blocked successfully` };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockIPService = async (ip) => {
  try {
    let idpDetails = await UserIP.findOne({ where: { ipAddress: ip } });

    if (!idpDetails) {
      throw new ExpressError(404, "IP address not found");
    }
    idpDetails.isBlocked = false;
    await idpDetails.save();
    return { success: true, message: `IP ${ip} unblocked successfully` };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};
