import STATUS from "../../constants/Status.js";
import * as attendanceService from "../../services/admin/attendance.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const getAllAttendanceData = async (req, res, next) => {
  try {
    const response = await attendanceService.getAttendance(req.query);

    if (response.success) {
      return successResponse(
        res,
        {
          rows: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        "Success",
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
