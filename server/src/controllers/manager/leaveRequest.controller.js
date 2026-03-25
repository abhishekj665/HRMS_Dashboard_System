
import * as leaveApprovalService from "../../services/manager/leaveRequest.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";

export const approveLeaveRequest = async (req, res, next) => {
  try {
    const response = await leaveApprovalService.approveLeaveRequest(
      req.params.id,
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
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const rejectLeaveRequest = async (req, res, next) => {
  try {
    const response = await leaveApprovalService.rejectLeaveRequest(
      req.params.id,
      req.body.remark,
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
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequests = async (req, res, next) => {
  try {
    
    const response = await leaveApprovalService.getLeaveRequests(
      req.query,
      req.user,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
