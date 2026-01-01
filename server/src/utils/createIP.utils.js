import { UserIP } from "../models/index.model.js";
import ExpressError from "./Error.utils.js";

export const createIP = async (req) => {
  try {
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    if (ip === "::1") {
      ip = "127.0.0.1";
    }

    const res = await UserIP.create({
      userId: req.user.id,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
    });
    return res;
  } catch (error) {
    throw new ExpressError(500, error.message);
  }
};
