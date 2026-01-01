import * as userService from "../services/users.service.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";

export const getUsers = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 5;

    const result = await userService.getUsers(page, limit);
    if (result.success) {
      return successResponse(res, result, result.message);
    } else {
      return errorResponse(res, result.message, 500);
    }
  } catch (error) {
    next(error);
  }
};

// export const createUser = async (req, res) => {
//   try {
//     const result = await userService.createUser(req.body);
//     if (result.success) {
//       return successResponse(res, result, result.message, 201);
//     } else {
//       return errorResponse(res, result.message);
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.updateUser(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    let { id } = req.params;

    let result = await userService.deleteUser(id);
    if (result.success) {
      return successResponse(res, result, result.message, 200);
    } else {
      return errorResponse(res, result.message, 500);
    }
  } catch (error) {
    next(error);
  }
};
