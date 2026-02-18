import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as leaveTypeService from "../../services/LMS/leaveType.service.js";
import STATUS from "../../constants/Status.js";

export const registerLeaveType = async (req, res, next) => {
  try {
    const response = await leaveTypeService.registerLeaveType(req.body);

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};



