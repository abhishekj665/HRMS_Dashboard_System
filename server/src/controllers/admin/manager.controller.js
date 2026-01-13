import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as managerServices from "../../services/admin/manager.service.js";
import STATUS from "../../constants/Status.js";

export const getAllManagersData = async (req, res, next) => {
  try {
    let response = await managerServices.getAllManagers();

    return successResponse(res, response.data, response.message, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const registerManager = async (req, res, next) => {
  try {
    let data = req.body.data;

    console.log(data);

    let response = await managerServices.registerManagerService(data);

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED
      );
    } else {
      return errorResponse(
        res,
        response.data,
        response.message,
        STATUS.BAD_GATEWAY
      );
    }
  } catch (error) {
    next(error);
  }
};

export const assignWorkersToManager = async (req, res, next) => {
  try {
    const response = await managerServices.assignWorkersToManagerService(
      req.body
    );
    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

export const getManagersWithUsers = async (req, res, next) => {
  try {
    const response = await managerServices.getManagersWithUsersService();
    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
