import * as CandidateService from "../../services/recruitment/candidate.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";
import ExpressError from "../../utils/Error.utils.js";

export const getCandidate = async (req, res, next) => {
  try {
    
    const response = await CandidateService.getCandidate(
      req.query.email,
      req.query.orgSlug,
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

export const getCandidateByJobPost = async (req, res, next) => {
  try {
    const response = await CandidateService.getCandidateByJobPost(
      req.params.id,
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

export const registerCandidate = async (req, res, next) => {
  try {
    const response = await CandidateService.registerCandidate(req.body);
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};
