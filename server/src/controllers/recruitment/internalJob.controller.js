import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as InternalJobService from "../../services/recruitment/internalJobs.service.js";
import * as ApplicationService from "../../services/recruitment/application.service.js";
import STATUS from "../../constants/Status.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

export const getInternalJobPosts = async (req, res, next) => {
  try {
    const response = await InternalJobService.getInternalJobPosts(req.user, req.query);
    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    }
    return errorResponse(res, response.message, STATUS.BAD_REQUEST);
  } catch (error) {
    next(error);
  }
};

export const getInternalJobPost = async (req, res, next) => {
  try {
    const response = await InternalJobService.getInternalJobPost(req.user, req.params.slug, req.query?.visibility);
    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.OK);
    }
    return errorResponse(res, response.message, STATUS.BAD_REQUEST);
  } catch (error) {
    next(error);
  }
};

export const applyToInternalJob = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, "A resume is required", STATUS.BAD_REQUEST);
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: "candidate-resumes",
      resource_type: "raw",
    });
    req.body.resumeUrl = uploaded.secure_url;
    const response = await ApplicationService.registerInternalApplication(req.user, req.params.slug, req.body);
    if (response.success) return successResponse(res, response.data, response.message, STATUS.CREATED);
    return errorResponse(res, response.message, STATUS.BAD_REQUEST);
  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
};

export const submitReferral = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, "A resume is required", STATUS.BAD_REQUEST);
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: "candidate-resumes",
      resource_type: "raw",
    });
    const response = await InternalJobService.submitReferral(req.user, req.params.slug, req.body, uploaded.secure_url);
    if (response.success) {
      return successResponse(res, response.data, response.message, STATUS.CREATED);
    }
    return errorResponse(res, response.message, STATUS.BAD_REQUEST);
  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
};
