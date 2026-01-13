import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as userServices from "../../services/admin/user.service.js";

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

export const blockUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const result = await userServices.blockUserService(userId);

    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const unblockUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await userServices.unblockUserService(userId);
    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const blockIPController = async (req, res, next) => {
  try {
    const { ip } = req.body;

    const result = await userServices.blockIPService(ip);
    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const unblockIPController = async (req, res, next) => {
  try {
    const { ip } = req.body;

    const result = await userServices.unblockIPService(ip);
    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 5;

    const result = await userServices.getUsersService(page, limit);

    if (result.success) {
      return successResponse(res, result, result.message);
    } else {
      return errorResponse(res, result.message, 500);
    }
  } catch (error) {
    next(error);
  }
};
