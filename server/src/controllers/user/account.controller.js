import STATUS from "../../constants/Status.js";
import * as accountServices from "../../services/user/account.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const getAccountData = async () => {
  try {
    let response = await accountServices.getAccountDataService(req.user);

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED
      );
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const registerAccount = async (req, res, next) => {
  try {
    let response = await accountServices.registerAccountService(
      req.body,
      req.user
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      errorResponse(res, response.message, STATUS.NOT_ACCEPTABLE);
    }
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    let response = await accountServices.updateAccountService(
      req.body,
      req.user
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
