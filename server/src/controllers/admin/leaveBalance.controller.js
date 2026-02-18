import * as leaveBalanceService from "../../services/LMS/leaveBalance.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";

export const assignLeaveBalances = async (req, res, next) => {
  try {
    const response = await leaveBalanceService.assignLeaveBalances(
      req.params.id,
      req.body,
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
