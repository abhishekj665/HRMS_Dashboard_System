import * as ApplicationService from "../../services/recruitment/application.service.js";
import { successResponse, errorResponse } from "../../utils/response.utils.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

export const registerApplication = async (req, res, next) => {
  try {

    
    let resumeUrl = null;

    if (req.file) {
      try {
        const upload = await cloudinary.uploader.upload(req.file.path, {
          folder: "expense-bills",
        });
        resumeUrl = upload.secure_url;
      } finally {
        fs.unlinkSync(req.file.path);
      }
    }
    req.body.resumeUrl = resumeUrl;


    const response = await ApplicationService.registerApplication(
      req.params.orgSlug,
      req.params.slug,
      req.body,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        response.status,
      );
    } else {
      return errorResponse(res, response.message, response.status);
    }
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const response = await ApplicationService.getApplications(req.query, req.user);

    if (response.success) {
      return successResponse(res, response.data, response.message);
    } else {
      return errorResponse(res, response.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const response = await ApplicationService.getApplicationById(
      req.params.id,
      req.user,
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

export const shortlistApplication = async (req, res, next) => {
  

  try {
    const response = await ApplicationService.shortlistApplication(
      req.params.id,
      req.user,
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

export const rejectApplication = async (req, res, next) => {
  try {
    const response = await ApplicationService.rejectApplication(
      req.params.id,
      req.user,
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
