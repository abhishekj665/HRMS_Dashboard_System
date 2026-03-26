import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import {
  User,
  AttendancePolicy,
  Employee,
  Organization,
} from "../../models/Associations.model.js";
import { generateHash } from "../../utils/hash.utils.js";
import { sequelize } from "../../config/db.js";
import {
  getScopedWhere,
  getTenantOrGlobalWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";
import { getInviteEmailTemplate } from "../../utils/mailTemplate.utils.js";
import { env } from "../../config/env.js";
import { sendMail } from "../../config/otpService.js";

export const getAllManagers = async (adminUser) => {
  try {
    const admin = await User.findOne({
      where: { id: adminUser.id, role: "admin" },
    });

    const tenantId = admin.tenantId;

    const managerData = await User.findAll({
      where: { tenantId, role: "manager" },
    });

    if (!managerData) {
      return {
        success: false,
        message: "Manager Data Not Found",
      };
    }

    return {
      success: true,
      data: managerData,
      message: "Manager Data Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const registerManagerService = async (data, adminUser) => {
  const transaction = await sequelize.transaction();
  try {
    const { email, password } = data;
    const tenantId = requireTenantId(adminUser);

    const existingManager = await User.findOne({
      where: { email, tenantId },
      transaction,
    });

    if (existingManager) {
      throw new ExpressError(400, "Manager with this email already exists");
    }

    const hashedPassword = await generateHash(password);

    const attendancePolicy = await AttendancePolicy.findOne({
      where: getTenantOrGlobalWhere(tenantId, { isDefault: true }),
      order: [["tenantId", "DESC"]],
    });

    const managerData = await User.create(
      {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email,
        contact: data.contact || 0,
        tenantId,
        password: hashedPassword,
        role: "manager",
        attendancePolicyId: attendancePolicy?.id || null,
      },
      { transaction },
    );

    // const employee = await Employee.create({
    //   userId: managerData.id,
    //   tenantId,
    //   role: "manager",
    // }, { transaction });

    const organization = await Organization.findOne({
      where: { id: tenantId },
      transaction,
    });

    const html = getInviteEmailTemplate({
      name: managerData.first_name || managerData.email.split("@")[0],
      role: "Manager",
      companyName: organization?.name || "our organization",
      inviteLink: env.client_url,
      password: password,
      email,
      password,
    });

    await sendMail(email, "Welcome to the team!", html);

    await transaction.commit();

    return {
      success: true,
      data: managerData,
      message: "Message Register Successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const assignWorkersToManagerService = async (
  { managerId, workerIds },
  adminUser,
) => {
  const transaction = await sequelize.transaction();
  const tenantId = requireTenantId(adminUser);

  try {
    if (!managerId || !workerIds?.length) {
      throw new ExpressError(400, "ManagerId and workerIds are required");
    }

    const manager = await User.findOne({
      where: { id: managerId, role: "manager", tenantId },
      transaction,
    });

    if (!manager) {
      throw new ExpressError(404, "Manager not found");
    }

    const workers = await User.findAll({
      where: { id: workerIds, role: "employee", tenantId },
      transaction,
    });

    if (workers.length !== workerIds.length) {
      throw new ExpressError(400, "One or more workers are invalid");
    }

    await User.update({ managerId }, { where: { id: workerIds }, transaction });

    await transaction.commit();

    return {
      success: true,
      message: "Workers assigned to manager successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getManagersWithUsersService = async (adminUser) => {
  const tenantId = requireTenantId(adminUser);
  try {
    const managers = await User.findAll({
      where: getScopedWhere(adminUser, { role: "manager" }),
      attributes: ["id", "email", "first_name", "last_name"],
      include: [
        {
          model: User,
          as: "workers",
          attributes: ["id", "email", "first_name", "last_name"],
          where: { tenantId },
          required: false,
        },
      ],
    });

    return {
      success: true,
      data: managers,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
