import STATUS from "../../constants/Status.js";
import ExpressError from "../../utils/Error.utils.js";
import {
  Organization,
  User,
  OTP,
  OrganizationLegal,
  OrganizationProfile,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import { generateHash } from "../../utils/hash.utils.js";
import { generateOtp, sendMail } from "../../config/otpService.js";
import {
  generateOrganizationSuccessEmail,
  generateOrgVerificationEmail,
} from "../../utils/mailTemplate.utils.js";

export const registerOrganization = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const organizationData = data.organization;
    const organizationProfileData = data.profile;
    const legalData = data.legal;
    const adminData = data.adminData;
    const normalizedOrganizationName = organizationData.name?.trim();
    const normalizedDomain = organizationData.domain?.trim() || "";

    const existingUser = await User.findOne({
      where: { email: adminData.email },
      transaction,
    });

    if (existingUser) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Admin with this email already exists",
      );
    }

    const existingOrganization = await Organization.findOne({
      where: { name: normalizedOrganizationName },
      transaction,
    });

    if (existingOrganization) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Organization with this name already exists",
      );
    }

    const password = "Admin@123";

    const hashedPassword = await generateHash(password);

    const admin = await User.create(
      {
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        contact: adminData.contactNumber,
        email: adminData.email,
        password: hashedPassword,
        role: "admin",
      },
      { transaction },
    );

    const organization = await Organization.create(
      {
        name: normalizedOrganizationName,
        industry: organizationData.industry,
        domain: normalizedDomain,
        ownerId: admin.id,
        status: organizationData.status || "Active",
      },
      { transaction },
    );

    const profile = await OrganizationProfile.create(
      {
        organizationId: organization.id,
        organizationName: organizationProfileData.organizationName,
        logoUrl: organizationProfileData.logoUrl,
        contactNumber: organizationProfileData.contactNumber,
        address: organizationProfileData.address,
        city: organizationProfileData.city,
        state: organizationProfileData.state,
        country: organizationProfileData.country,
        postalCode: organizationProfileData.postalCode,
        website: organizationProfileData.website,
      },
      { transaction },
    );

    const legal = await OrganizationLegal.create(
      {
        organizationId: organization.id,
        panNumber: legalData.panNumber,
        gstNumber: legalData.gstNumber,
        panCertificateUrl: legalData.panCertificateUrl,
        gstCertificateUrl: legalData.gstCertificateUrl,
      },
      { transaction },
    );

    admin.tenantId = organization.id;

    await admin.save({ transaction });

    const otp = generateOtp();
    const hash = await generateHash(otp);

    await OTP.create(
      {
        email: admin.email,
        otp: hash,
        purpose: "SIGNUP",
      },
      { transaction },
    );
    // await transaction.commit();

    const html = generateOrgVerificationEmail({
      name: admin.first_name || admin.email.split("@")[0],
      organizationName: organization.name,
      otp,
    });

    const organizationRegiterMailHtml = generateOrganizationSuccessEmail({
      name: admin.first_name || admin.email.split("@")[0],
      organizationName: organization.name,
    });

    sendMail(
      admin.email,
      "Welcome to HRMS Dashboard – Organization Successfully Registered",
      organizationRegiterMailHtml,
    );

    sendMail(
      admin.email,
      "Verify your email to complete organization registration",
      html,
    );
    return {
      success: true,
      message: "Please verify your email",
      status: STATUS.CREATED,
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
