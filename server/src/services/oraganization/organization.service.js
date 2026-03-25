import STATUS from "../../constants/Status.js";
import ExpressError from "../../utils/Error.utils.js";
import {
  Organization,
  User,
  OrganizationLegal,
  OrganizationProfile,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import { generateHash } from "../../utils/hash.utils.js";

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
    await transaction.commit();
    return {
      success: true,
      message: "Organization registered successfully",
      data: {
        organization,
        admin,
        profile,
        legal,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
