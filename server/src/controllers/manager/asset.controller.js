import { successResponse, errorResponse } from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";
import * as assetServices from "../../services/manager/asset.service.js";

export const getAllAsset = async (req, res, next) => {
  try {
    let response = await assetServices.getAllAsset();

    if (response.success) {
      successResponse(res, response, response.message, STATUS.ACCEPTED);
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
export const getAvailableAssets = async (req, res, next) => {
  try {
    const assets = await assetServices.getAvailableAssetsService();
    return successResponse(res, { assets }, "Assets fetched", 200);
  } catch (e) {
    next(e);
  }
};
