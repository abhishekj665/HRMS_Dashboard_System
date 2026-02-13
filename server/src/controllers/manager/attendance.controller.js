import STATUS from "../../constants/Status.js";
import * as attendanceService from "../../services/manager/attendance.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const getAttendanceData = async (req, res, next) => {
  try {
    const response = await attendanceService.getAttendance(req.query,req.user.id);

    if (response.success) {
      return successResponse(
        res,
        response,
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


export const approveAttendanceRequest = async (req, res, next) => {
  try {
    const response = await attendanceService.approveAttendanceRequest(
      req.user.id,
      req.params.id,
    );

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

export const rejectAttendanceRequest = async (req, res, next) => {
  try {
    
    const response = await attendanceService.rejectAttendanceRequest(
      req.user.id,
      req.params.id,
    );

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
