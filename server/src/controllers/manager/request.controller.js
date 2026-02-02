import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as requestServices from "../../services/manager/request.service.js";

import { io } from "../../server.js";

export const getRequestData = async (req, res, next) => {
  try {
    const response = await requestServices.getRequestDataService();

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED
      );
    } else {
      return errorResponse(req, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const manager = req.user;

    const response = await requestServices.approveRequestService(
      req.params.id,
      manager
    );

    if (response.success) {
      io.to("manager").emit("requestUpdated");

      io.to(`user:${response.userId}`).emit("requestUpdated");

      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res,response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const remark = req.body.remark;
    const manager = req.user;

    const response = await requestServices.rejectRequestService(
      req.params.id,
      remark,
      manager
    );

    if (response.success) {
      io.to("manager").emit("requestUpdated");

      io.to(`user:${response.userId}`).emit("requestUpdated");

      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const createAssetRequest = async (req, res, next) => {
  try {
    const { assetId, quantity, description, title } = req.body;

    let response = await requestServices.createAssetRequestService(
      { assetId, quantity, description, title },
      req.user
    );

    if (response.success) {
      io.to("manager").emit("requestCreated", {
        message: "New request created",
      });
      return successResponse(res, response, response.message, STATUS.CREATED);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
