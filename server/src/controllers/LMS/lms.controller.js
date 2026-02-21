import * as lmsLeaveTypeService from "../../services/LMS/leaveType.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";

export const getLeaveTypes = async (req, res, next) => {
  try {
    const response = await lmsLeaveTypeService.getLeaveTypes();

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
