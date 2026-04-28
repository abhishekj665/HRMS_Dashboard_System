import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as requestServices from "../../services/manager/request.service.js";

import { io } from "../../server.js";
import {
  getAdminRoom,
  getManagerRoom,
  getUserRoom,
} from "../../utils/socketRooms.utils.js";

export const getRequestData = async (req, res, next) => {
  try {
    const response = await requestServices.getRequestDataService(req.user);

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
      io.to(getManagerRoom(req.user.tenantId)).emit("requestUpdated");

      io.to(getAdminRoom(req.user.tenantId)).emit("requestUpdated", {
        message: "Request status updated",
      });


      io.to(getUserRoom(response.userId, req.user.tenantId)).emit("requestUpdated");

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
      io.to(getManagerRoom(req.user.tenantId)).emit("requestUpdated");

      io.to(getAdminRoom(req.user.tenantId)).emit("requestUpdated", {
        message: "Request status updated",
      });


      io.to(getUserRoom(response.userId, req.user.tenantId)).emit("requestUpdated");

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
      io.to(getManagerRoom(req.user.tenantId)).emit("requestCreated", {
        message: "New request created",
      });
      io.to(getAdminRoom(req.user.tenantId)).emit("requestCreated", {
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
