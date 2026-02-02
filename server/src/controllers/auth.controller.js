import * as authServices from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";
import { setCookie } from "../services/cookie.service.js";
import STATUS from "../constants/Status.js";
import AppError from "../utils/Error.utils.js";

import { clearCookie } from "../services/cookie.service.js";

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
