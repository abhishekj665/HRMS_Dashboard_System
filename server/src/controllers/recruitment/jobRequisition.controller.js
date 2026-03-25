import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as JobRequisitionService from "../../services/recruitment/jobRequisition.service.js";

export const registerJobRequisition = async (req, res, next) => {
  try {
    const response = await JobRequisitionService.registerJobRequisition(
      req.body,
      req.user,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.CREATED,
      );
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getJobRequisitions = async (req, res, next) => {
  try {
    const response = await JobRequisitionService.getJobRequisitions(req.user);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getJobRequisition = async (req, res, next) => {
  try {
    const response = await JobRequisitionService.getJobRequisition(
      req.params.id,
      req.user,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const updateJobRequisition = async (req, res, next) => {
  try {
    const response = await JobRequisitionService.updateJobRequisition(
      req.params.id,
      req.body,
      req.user,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const approveJobRequisition = async (req, res, next) => {
  try {
    const response = await JobRequisitionService.approveJobRequisition(
      req.params.id,
      req.user,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const rejectJobRequisition = async (req, res, next) => {
  try {
    const response = await JobRequisitionService.rejectJobRequisition(
      req.params.id,
      req.body.remark,
      req.user,
    );

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
