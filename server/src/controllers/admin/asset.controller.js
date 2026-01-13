import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as assetServices from "../../services/admin/asset.service.js";

export const createAsset = async (req, res, next) => {
  try {
    const response = await assetServices.createAssetService(req.body);

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.CREATED
      );
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getAllAsset = async (req, res, next) => {
  try {
    let response = await assetServices.getAllAsset();

    if (response.success) {
      successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    let response = await assetServices.deleteAssetService(req.params.id);
    if (response.success) {
      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    let response = await assetServices.updateAssetService(
      req.params.id,
      req.body
    );
    if (response.success) {
      successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getAllExpense = async () => {
  try {
    let response = await hjv;
  } catch (error) {}
};
