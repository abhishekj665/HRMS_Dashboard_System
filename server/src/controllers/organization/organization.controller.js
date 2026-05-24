import { successResponse, errorResponse } from "../../utils/response.utils.js";
import * as organizationService from "../../services/oraganization/organization.service.js";
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

export const registerOrganization = async (req, res, next) => {
  try {
    const bodyData = req.body?.payload ? JSON.parse(req.body.payload) : req.body;

    const gstFile = req.files?.gstFile?.[0];
    const panFile = req.files?.panFile?.[0];
    const logoFile = req.files?.logoFile?.[0];

    const [gstCertificateUrl, panCertificateUrl, logoUrl] = await Promise.all([
      uploadToCloudinary(gstFile, "organization-documents"),
      uploadToCloudinary(panFile, "organization-documents"),
      uploadToCloudinary(logoFile, "organization-logos"),
    ]);

    if (!bodyData.legal) bodyData.legal = {};
    if (!bodyData.profile) bodyData.profile = {};

    bodyData.legal.gstCertificateUrl = gstCertificateUrl;
    bodyData.legal.panCertificateUrl = panCertificateUrl;
    bodyData.profile.logoUrl = logoUrl || bodyData.profile.logoUrl || null;

    const response = await organizationService.registerOrganization(bodyData);
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
