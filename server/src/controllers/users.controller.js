import STATUS from "../config/constants/Status.js";
import * as userService from "../services/users.service.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";

export const getUsers = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 5;

    const result = await userService.getUsersService(page, limit);

    if (result.success) {
      return successResponse(res, result, result.message);
    } else {
      return errorResponse(res, result.message, 500);
    }
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.updateUserService(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    let { id } = req.params;

    let result = await userService.deleteUserService(id);
    if (result.success) {
      return successResponse(res, result, result.message, 200);
    } else {
      return errorResponse(res, result.message, 500);
    }
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    let id = req.user.id;

    let response = await userService.getProfileService(id);

    if (response.success) {
      return successResponse(res, response, response.message, 200);
    } else {
      return errorResponse(res, response.message, 404);
    }
  } catch (error) {
    next(error);
  }
};

export const createAssetRequest = async (req, res, next) => {
  try {
    let response = await userService.createAssetRequestService(
      req.body,
      req.user
    );

    if (response.success) {
      return successResponse(res, response, response.message, STATUS.CREATED);
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getAssetRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let response = await userService.getAssetRequestService(userId);

    if (response.success) {
      return successResponse(res, response, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.GONE);
    }
  } catch (error) {
    next(error);
  }
};
