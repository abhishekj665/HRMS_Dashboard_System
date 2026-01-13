import * as userInfoServices from "../../services/user/userInfo.service.js";
import STATUS from "../../constants/Status.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userInfoServices.updateUserService(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    let { id } = req.params;

    let result = await userInfoServices.deleteUserService(id);
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

    let response = await userInfoServices.getProfileService(id);

    if (response.success) {
      return successResponse(res, response, response.message, 200);
    } else {
      return errorResponse(res, response.message, 404);
    }
  } catch (error) {
    next(error);
  }
};
