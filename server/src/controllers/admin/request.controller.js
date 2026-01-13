import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as requestServices from "../../services/admin/request.service.js";

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
      return errorResponse(req, res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const adminRole = req.user.role;

    const response = await requestServices.approveRequestService(
      req.params.id,
      adminRole
    );

    if (response.success) {
      io.to("admin").emit("requestUpdated");

      io.to(`user:${response.userId}`).emit("requestUpdated");

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
      remark
    );

    if (response.success) {
      io.to("admin").emit("requestUpdated");

      io.to(`user:${response.userId}`).emit("requestUpdated");

      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
