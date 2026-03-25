import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as JobPostingService from "../../services/recruitment/jobPosting.service.js";
import STATUS from "../../constants/Status.js";

export const updateJobPosting = async (req, res, next) => {
  try {
    const response = await JobPostingService.updateJobPosting(
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

export const getJobPosting = async (req, res, next) => {
  try {
    const response = await JobPostingService.getJobPosting(req.params.id, req.user);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getJobPostings = async (req, res, next) => {
  try {
    const response = await JobPostingService.getJobPostings(req.user);

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const activeJobPosting = async (req, res, next) => {
  try {
    const response = await JobPostingService.activeJobPosting(
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

export const getJobs = async (req, res, next) => {
  try {
    const response = await JobPostingService.getJobs();

    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};


export const getJob = async (req, res, next) => {
  try {
    const response = await JobPostingService.getJob(
      req.params.orgSlug,
      req.params.slug,
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
