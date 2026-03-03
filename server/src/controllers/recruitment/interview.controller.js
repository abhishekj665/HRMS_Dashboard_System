import * as interviewService from "../../services/recuirment/interview.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";

export const getInterviewers = async (req, res, next) => {
  try {
    const response = await interviewService.getInterviewers();
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const assignInterview = async (req, res, next) => {
  try {
    const response = await interviewService.assignInterview(req.body, req.user.id);
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const response = await interviewService.getInterviews(
      req.user.id,
      req.query,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const confirmInterview = async (req, res, next) => {
  try {
    const response = await interviewService.confirmInterview(req.params.id, req.user.id);

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const declineAssignedInterview = async (req, res, next) => {
  try {
    const response = await interviewService.declineAssignedInterview(
      req.params.id,
      req.body.remark,
      req.user.id,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getActiveInterview = async (req, res, next) => {
  try {
    const response = await interviewService.getActiveInterview(req.params.id);

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const rescheduleInterview = async (req, res, next) => {
  try {
    const response = await interviewService.rescheduleInterview(req.params.id, req.body, req.user.id);

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

