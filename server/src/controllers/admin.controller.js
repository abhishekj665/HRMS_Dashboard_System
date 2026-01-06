import { successResponse, errorResponse } from "../utils/response.utils.js";
import STATUS from "../config/constants/Status.js";
import * as adminServices from "../services/admin.service.js";

export const blockUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const result = await adminServices.blockUserService(userId);

    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const unblockUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await adminServices.unblockUserService(userId);
    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const blockIPController = async (req, res, next) => {
  try {
    const { ip } = req.body;

    const result = await adminServices.blockIPService(ip);
    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const unblockIPController = async (req, res, next) => {
  try {
    const { ip } = req.body;

    const result = await adminServices.unblockIPService(ip);
    if (!result.success) {
      return errorResponse(res, result.message, STATUS.BAD_REQUEST);
    } else {
      return successResponse(res, result, result.message, STATUS.OK);
    }
  } catch (error) {
    next(error);
  }
};

export const getRequestData = async (req, res, next) => {
  try {
    const response = await adminServices.getRequestDataService();

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
  try{
    let response = await adminServices.approveRequestService(req.params.id);
    if(response.success){
      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    }else{
      return errorResponse(res, response.message, STATUS.BAD_REQUEST)
    }

  }catch(error){
    next(error)
  }
}

export const rejectRequest = async (req, res, next) => {
  try{
    let response = await adminServices.rejectRequestService(req.params.id);
    if(response.success){
      return successResponse(res, response, response.message, STATUS.ACCEPTED);
    }else{
      return errorResponse(res, response.message, STATUS.BAD_REQUEST)
    }

  }catch(error){
    next(error)
  }
}

