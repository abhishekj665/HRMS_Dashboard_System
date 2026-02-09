import * as authServices from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";
import { setCookie } from "../services/cookie.service.js";
import STATUS from "../constants/Status.js";
import AppError from "../utils/Error.utils.js";
import { UserIP } from "../models/Associations.model.js";

import { clearCookie } from "../services/cookie.service.js";
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

    if (purpose != undefined || otp != undefined || email != undefined) {
      purpose = purpose.toUpperCase();
    } else {
      throw new AppError(403, "Email or Purpose or OTP is required");
    }

    const result = await authServices.verifyOtpService(email, otp, purpose);

    if (result.success) {
      return successResponse(res, result, result.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, result.message, STATUS.NOT_ACCEPTABLE);
    }
  } catch (error) {
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const result = await authServices.logInService(req.body);

    if (!result.success) {
      return errorResponse(
        res,

        result.message,
        STATUS.UNAUTHORIZED,
      );
    }

    setCookie(res, "token", result.token);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const ipData = await getLocationFromIp("8.8.8.8");

    await UserIP.create({
      userAgent: req.headers["user-agent"] || "unknown",
      ipAddress: ipData?.ip || ip,
      country: ipData?.country_name || null,
      region: ipData?.state_prov || null,
      city: ipData?.city || null,
      isp: ipData?.isp || ipData?.organization || null,
      userId: result.user.id,
    });

    return successResponse(res, result, result.message, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, res, next) => {
  try {
    let response = await authServices.logOutService(req.user.id);

    if (response.success) {
      clearCookie(res, "token");
      return successResponse(
        res,
        response.data,
        "User Successfully LogOut",
        STATUS.OK,
      );
    } else {
      return errorResponse(
        res,

        "Something went wrong",
        STATUS.UNAUTHORIZED,
      );
    }
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const response = authServices.me();

    if (response.success) {
      return successResponse(res, response.user, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.UNAUTHORIZED);
    }
  } catch (error) {
    next(error);
  }
};
