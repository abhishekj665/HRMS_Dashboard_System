import STATUS from "../../constants/Status.js";
import ExpressError from "../../utils/Error.utils.js";
import { Organization, User } from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";

export const registerOrganization = async (organizationData) => {
  const transaction = await sequelize.transaction();
  try {
    const organization = await Organization.create(organizationData, {
      transaction,
    });

    const admin = await User.create(
      {
        name: organizationData.adminName,
        email: organizationData.adminEmail,
        password: organizationData.adminPassword,
        role: "admin",
        tenantId: organization.id,
      },
      { transaction },
    );

    organization.ownerId = admin.id;
    await admin.save({ transaction });
    await transaction.commit();
    return {
      success: true,
      message: "Organization registered successfully",
      data: organization,
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
