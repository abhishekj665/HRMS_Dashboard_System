import * as profileServices from "../../services/profile/profile.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

const uploadToCloudinary = async (file, folder) => {
  if (!file) return null;
  try {
    const upload = await cloudinary.uploader.upload(file.path, { folder });
    return upload.secure_url;
  } finally {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const id = req.user.id;
    const response = await profileServices.getProfileService(id);

    if (response.success) {
      return successResponse(res, response, response.message, 200);
    }
    return errorResponse(res, response.message, 404);
  } catch (error) {
    next(error);
  }
};

export const upsertProfile = async (req, res, next) => {
  try {
    const id = req.user.id;
    const response = await profileServices.upsertProfileService(id, req.body);

    if (response.success) {
      return successResponse(res, response, "Profile updated successfully", 200);
    }
    return errorResponse(res, response.message, 400);
  } catch (error) {
    next(error);
  }
};

export const uploadProfileDocuments = async (req, res, next) => {
  try {
    const id = req.user.id;

    const profileFile = req.files?.profileFile?.[0];
    const adharFile = req.files?.adharFile?.[0];
    const panCardFile = req.files?.panCardFile?.[0];

    const [profileUrl, adharUrl, panCardUrl] = await Promise.all([
      uploadToCloudinary(profileFile, "profile-documents"),
      uploadToCloudinary(adharFile, "profile-documents"),
      uploadToCloudinary(panCardFile, "profile-documents"),
    ]);

    const payload = {};
    if (profileUrl) payload.profileUrl = profileUrl;
    if (adharUrl) payload.adharUrl = adharUrl;
    if (panCardUrl) payload.panCardUrl = panCardUrl;

    const response = await profileServices.upsertProfileService(id, payload);

    if (response.success) {
      return successResponse(res, response, "Profile documents updated successfully", 200);
    }
    return errorResponse(res, response.message, 400);
  } catch (error) {
    next(error);
  }
};
