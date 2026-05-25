import * as paymentServices from "../../services/payment/payment.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";

export const createOrder = async (req, res, next) => {
  try {
    const response = await paymentServices.createOrder(req.body, req.user.id);
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

export const validateWebHook = async (req, res, next) => {
    try{
        const webHookSignature = req.get("X-Razorpay-Signature");
        const response = await paymentServices.validateWebHook(webHookSignature, req.body);

        if(response.success){
            return successResponse(res, response.data, response.message, response.status);

        }

        return errorResponse(res, response.message, response.status);

    }catch(error){next(error)}
}
