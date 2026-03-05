import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as hiringStageService from "../../services/recruitment/hiringStage.service.js";

export const moveToNextStage = async (req, res, next) => {
  try {
    const response = await hiringStageService.moveToNextStage(
      req.params.applicationId,
      req.user.id,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message, response.status);
    }
  } catch (error) {
    next(error);
  }
};
