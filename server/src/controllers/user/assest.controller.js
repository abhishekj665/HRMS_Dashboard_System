import * as assestServices from "../../services/user/asset.service.js";
import STATUS from "../../constants/Status.js";

import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { io } from "../../server.js";

export const createAssetRequest = async (req, res, next) => {
  try {
    const { assetId, quantity, description, title } = req.body;

    let response = await assestServices.createAssetRequestService(
      { assetId, quantity, description, title },
      req.user
    );

    if (response.success) {
      io.to("manager").emit("requestCreated", {
        message: "New request created",
      });

      io.to("admin").emit("requestCreated", {
        message: "New request created",
      });

      return successResponse(res, response, response.message, STATUS.CREATED);
    } else {
      return errorResponse(res,response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getAssetRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let response = await assestServices.getAssetRequestService(userId);

    if (response.success) {
      return successResponse(res, response, response.message, STATUS.OK);
    } else {
      return errorResponse(res, response.message, STATUS.GONE);
    }
  } catch (error) {
    next(error);
  }
};

export const getAvailableAssets = async (req, res, next) => {
  try {
    const assets = await assestServices.getAvailableAssetsService();
    return successResponse(res, { assets }, "Assets fetched", 200);
  } catch (e) {
    next(e);
  }
};
