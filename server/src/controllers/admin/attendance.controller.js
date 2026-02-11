import STATUS from "../../constants/Status.js";
import * as userAttendanceService from "../../services/admin/attendance.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const getUserAttendanceData = async (req, res, next) => {
  try {
    const response = await userAttendanceService.getUserAttendance();

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

export const getManagerAttendanceData = async (req, res, next) => {
  try {
    const response = await userAttendanceService.getManagerAttendance();

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

export const pendingUserAttendanceRequest = async (req, res, next) => {
  try {
    const response =
      await userAttendanceService.pendingUserAttendanceRequests();
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

export const pendingManagerAttendanceRequest = async (req, res, next) => {
  try {
    const response =
      await userAttendanceService.pendingManagerAttendanceRequests();
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

export const rejectedUserAttendanceRequest = async (req, res, next) => {
  try {
    const response =
      await userAttendanceService.rejectedUserAttendanceRequest();

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

export const rejectedManagerAttendanceRequest = async (req, res, next) => {
  try {
    const response =
      await userAttendanceService.rejectedManagerAttendanceRequest();

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

export const approvedUserAttendanceRequest = async (req, res, next) => {
  try {
    const response = await userAttendanceService.approvedUserAttendanceRequest(
      
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

export const approvedManagerAttendanceRequest = async (req, res, next) => {
  try {
    const response = await userAttendanceService.approvedManagerAttendanceRequest(
      
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

export const approveAttendanceRequest = async (req, res, next) => {
  try {
    const response = await userAttendanceService.approveAttendanceRequest(
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
    const response = await userAttendanceService.rejectAttendanceRequest(
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
