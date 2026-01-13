import * as authServices from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";
import { setCookie } from "../services/cookie.service.js";
import STATUS from "../constants/Status.js";
import ExpressError from "../utils/Error.utils.js";

import { UserIP } from "../models/Associations.model.js";
import { getLocationFromIp } from "../utils/geo.utils.js";

export const signUp = async (req, res, next) => {
  try {
    const result = await authServices.signUpService(req.body);

    if (result.success) {
      return successResponse(res, result, result.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, result.message, STATUS.NOT_ACCEPTABLE);
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    let { email, otp, purpose } = req.body;

    if (purpose != undefined) {
      purpose = purpose.toUpperCase();
    } else {
      throw new ExpressError(403, "Purpose is required");
    }

    const result = await authServices.verifyOtpService(email, otp, purpose);

    if (result) {
      setCookie(res, "token", result.token);

      let ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
      if (ip === "::1") ip = "1.1.1.1";

      const userAgent = req.headers["user-agent"] || "UNKNOWN";

      const existingIp = await UserIP.findOne({
        where: { userId: result.user.id, ipAddress: ip },
      });

      if (existingIp) {
        existingIp.failedLogInAttempt = 0;
        await existingIp.save();
      } else {
        const address = await getLocationFromIp(ip);
        await UserIP.create({
          userId: result.user.id,
          ipAddress: ip,
          isBlocked: false,
          userAgent,
          country: address.country_name,
          region: address.region_name,
          city: address.city,
          isp: address.isp,
          failedLogInAttempt: 0,
        });
      }

      return successResponse(res, result, result.message, STATUS.ACCEPTED);
    }
  } catch (error) {
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const result = await authServices.logInService(req.body);

    if (!result.success) {
      return errorResponse(res, result.message, STATUS.UNAUTHORIZED);
    }

    let ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";

    if (ip === "::1") {
      ip = "1.1.1.1";
    }

    let ipDetails = await UserIP.findOne({ where: { ipAddress: ip } });

    if (ipDetails && ipDetails.isBlocked && result.user.role !== "admin") {
      return errorResponse(
        res,
        "IP address is blocked. Contact admin.",
        STATUS.UNAUTHORIZED
      );
    }

    setCookie(res, "token", result.token);

    const userAgent = req.headers["user-agent"] || "UNKNOWN";

    let ipInfo = await UserIP.findOne({
      where: { ipAddress: ip, userId: result.user.id },
    });

    if (ipInfo) {
      ipInfo.updateAt = new Date();
      await ipInfo.save();
    } else {
      const address = await getLocationFromIp(ip);
      await UserIP.create({
        userId: result.user.id,
        ipAddress: ip,
        isBlocked: false,
        userAgent,
        country: address.country_name,
        region: address.region_name,
        city: address.city,
        isp: address.isp,
        failedLogInAttempt: 0,
      });
    }

    return successResponse(
      res,
      {
        success: true,
        user: result.user,
        token: result.token,
      },
      "Login successful",
      STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
