import STATUS from "../../constants/Status.js";
import * as attendanceServices from "../../services/attendance/attendance.service.js";
import { getIP } from "../../utils/getIP.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const registerInController = async (req, res, next) => {
  try {
    const ipAddress = getIP(req);

    const response = await attendanceServices.registerInService(
      req.user,
      req.body,
      ipAddress,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const registerOutController = async (req, res, next) => {
  try {
    const ipAddress = getIP(req);

    const response = await attendanceServices.registerOutService(
      req.user,
      req.body,
      ipAddress,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getTodayAttendance = async (req, res, next) => {
  try {
    const response = await attendanceServices.getTodayAttendanceService(
      req.user,
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

export const getAttendanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const response = await attendanceServices.getAttendanceSummary(
      req.user,
      month,
      year,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getAttendanceByDate = async (req, res, next) => {
  try {
    const response = await attendanceServices.getAttendanceByDate(
      req.user,
      req.query,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};
