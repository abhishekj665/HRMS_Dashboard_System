import * as leaveService from "../../services/LMS/leaveRequest.service.js";
import * as leaveBalanceService from "../../services/LMS/leaveBalance.service.js";

import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";

export const registerLeaveRequest = async (req, res, next) => {
  try {
    const response = await leaveService.registerLeaveRequest(
      req.body,
      req.user.id,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequests = async (req, res, next) => {
  try {
    const response = await leaveService.getLeaveRequest(req.user.id);
    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getLeaveBalance = async (req, res, next) => {
  try {
    const response = await leaveBalanceService.getLeaveBalance(req.user.id);
    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
