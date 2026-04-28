import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as departmentService from "../../services/department/department.service.js";

export const registerDepartment = async (req, res, next) => {
  try {
    const response = await departmentService.registerDepartment(
      req.body,
      req.user.tenantId,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    return next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const response = await departmentService.getDepartments(req.user.tenantId);
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    return next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const response = await departmentService.getDepartmentById(
      req.params.id,
      req.user.tenantId,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    return next(error);
  }
};
