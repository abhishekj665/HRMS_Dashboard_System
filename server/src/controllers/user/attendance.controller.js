import STATUS from "../../constants/Status.js";
import * as userAttendanceService from "../../services/user/attendance.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const getAttendanceData = async (req, res, next) => {
  try {
    const response = await userAttendanceService.getAttendance(req.user.id);

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const pendingAttendanceRequest = async (req, res, next) => {
  try {
    const response = await userAttendanceService.pendingAttendanceRequests(
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

export const rejectedAttendanceRequest = async (req, res, next) => {
  try {
    const response = await userAttendanceService.rejectedAttendanceRequest(
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

export const approvedAttendanceRequest = async (req, res, next) => {
  try {
    const response = await userAttendanceService.approvedAttendanceRequest(
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
