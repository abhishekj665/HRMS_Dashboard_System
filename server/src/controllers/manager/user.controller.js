import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as userServices from "../../services/manager/user.service.js";

export const registerUser = async (req, res, next) => {
  try {
    let response = await userServices.registerUserService(req.body);

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 5;

    const result = await userServices.getUsersService(page, limit, req.user);

    if (result.success) {
      return successResponse(res, result, result.message);
    } else {
      return errorResponse(res, result.message, 500);
    }
  } catch (error) {
    next(error);
  }
};

