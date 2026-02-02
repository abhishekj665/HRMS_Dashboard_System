import STATUS from "../../constants/Status.js";
import * as accountServices from "../../services/manager/account.service.js";
import { sponse, successResponse } from "../../utils/response.utils.js";

export const getAccountData = async () => {
  try {
    let response = await accountServices.getAccountDataService(req.user);

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return sponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const registerAccount = async (req, res, next) => {
  try {
    let response = await accountServices.registerAccountService(
      req.body,
      req.user,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      sponse(res, response.message, STATUS.NOT_ACCEPTABLE);
    }
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    let response = await accountServices.updateAccountService(
      req.body,
      req.user,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res,null, response.message);
    }
  } catch (error) {
    next(error);
  }
};
