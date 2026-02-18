import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as leavePolicyService from "../../services/LMS/leavePolicy.service.js";
import STATUS from "../../constants/Status.js";



export const registerLeavePolicy = async (req, res, next) => {
  try {
    const response = await leavePolicyService.registerLeavePolicy(req.body, req.user.id);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const updateLeavePolicy = async (req, res, next) => {
  try {
    const response = await leavePolicyService.updateLeavePolicy(req.params.id,req.body, req.user.id);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteLeavePolicy = async (req, res, next) => {
  try {
    const response = await leavePolicyService.deleteLeavePolicy(req.params.id);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getLeavePolicies = async (req, res, next) => {


  try {
    const response = await leavePolicyService.getLeavePolicies();

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};
