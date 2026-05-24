import * as subscriptionServices from "../../services/subscription/subscription.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";

export const getSubscription = async (req, res, next) => {
  try {
    const response = await subscriptionServices.getSubscription(req.user.id);
    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        response.status,
      );
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
