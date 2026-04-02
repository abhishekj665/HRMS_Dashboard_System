import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as organizationService from "../../services/oraganization/organization.service.js";
import { response } from "express";

export const registerOrganization = async (req, res, next) => {
  try {
    const response = await organizationService.registerOrganization(req.body);
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
