import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as requestServices from "../../services/admin/request.service.js";

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
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(req, res.data, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const response = await requestServices.approveRequestService(
      req.params.id,
      req.user,
    );

    if (response.success) {
      io.to(getAdminRoom(req.user.tenantId)).emit("requestUpdated");
      io.to(getManagerRoom(req.user.tenantId)).emit("requestUpdated");

      io.to(getUserRoom(response.userId, req.user.tenantId)).emit("requestUpdated");

      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const remark = req.body.remark;

    const response = await requestServices.rejectRequestService(
      req.params.id,
      remark,
      req.user,
    );

    if (response.success) {
      io.to(getAdminRoom(req.user.tenantId)).emit("requestUpdated");
      io.to(getManagerRoom(req.user.tenantId)).emit("requestUpdated");

      io.to(getUserRoom(response.userId, req.user.tenantId)).emit("requestUpdated");

      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
