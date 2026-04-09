import ExpressError from "../../utils/Error.utils.js";
import { Employee, UserIP } from "../../models/Associations.model.js";
import {
  User,
  AttendancePolicy,
  Organization,
} from "../../models/Associations.model.js";
import { getPagination } from "../../utils/paginations.utils.js";
import STATUS from "../../constants/Status.js";
import { generateHash } from "../../utils/hash.utils.js";
import { Op } from "sequelize";
import { env } from "../../config/env.js";
import { sendMail } from "../../config/otpService.js";
import { sequelize } from "../../config/db.js";
import {
  getScopedWhere,
  getTenantOrGlobalWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";
import { getInviteEmailTemplate } from "../../utils/mailTemplate.utils.js";

export const getUsersService = async (page, limits, search, adminUser) => {
  try {
    const { limit, offset } = getPagination(page, limits);
    const tenantId = requireTenantId(adminUser);

    let whereCondition = { role: "employee", tenantId };

    if (search != "" && search.trim() !== "") {
      whereCondition = {
        tenantId,
        role: "employee",
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      distinct: true,
      col: "id",
      where: whereCondition,
      attributes: {
        exclude: [
          "password",
          "createdAt",
          "updatedAt",
          "contact",
          "attendancePolicyId",
          "login_At",
          "leavePolicyId",
          "deletedAt",
        ],
      },
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "email", "first_name", "last_name"],
        },
        {
          model: UserIP,
          required: false,
          attributes: ["ipAddress", "isBlocked", "createdAt", "updatedAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    const hasNext = page * limit < count;

    return {
      success: true,
      data: {
        users: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasNext,
        },
      },
      message: "Users fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(400, error.message);
  }
};

export const blockUserService = async (id, adminUser) => {
  try {
    const user = await User.findOne({
      where: getScopedWhere(adminUser, { id }),
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.role === "admin") {
      return { success: false, message: "Cannot block an admin user" };
    }
    user.isBlocked = true;
    await user.save();
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockUserService = async (userId, adminUser) => {
  try {
    const user = await User.findOne({
      where: getScopedWhere(adminUser, { id: userId }),
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    user.isBlocked = false;
    await user.save();
    return { success: true, message: "User unblocked successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const blockIPService = async (ip, adminUser) => {
  try {
    const [updatedCount] = await UserIP.update(
      { isBlocked: true },
      { where: getScopedWhere(adminUser, { ipAddress: ip }) },
    );

    if (updatedCount === 0) {
      throw new ExpressError(404, "IP address not found");
    }

    return {
      success: true,
      message: `IP ${ip} blocked successfully for all users`,
    };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockIPService = async (ip, adminUser) => {
  try {
    const [updatedCount] = await UserIP.update(
      { isBlocked: false },
      { where: getScopedWhere(adminUser, { ipAddress: ip }) },
    );

    if (updatedCount === 0) {
      throw new ExpressError(404, "IP address not found");
    }
    return { success: true, message: `IP ${ip} unblocked successfully` };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const registerUserService = async ({ data }, adminUser) => {
  const transaction = await sequelize.transaction();
  try {
    if (!data.email || !data.password) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    const tenantId = requireTenantId(adminUser);

    const existingUser = await User.findOne({
      where: { email: data.email, tenantId },
    });

    if (existingUser) {
      throw new ExpressError(STATUS.BAD_REQUEST, "User ALready exist");
    }
    let hashedPassword = await generateHash(data.password);

    const attendancePolicy = await AttendancePolicy.findOne({
      where: getTenantOrGlobalWhere(tenantId, { isDefault: true }),
      order: [["tenantId", "DESC"]],
    });

    const userData = await User.create(
      {
        ...data,
        tenantId,
        password: hashedPassword,
        attendancePolicyId: attendancePolicy?.id || null,
      },
      { transaction },
    );

    // const employee = await Employee.create({
    //   userId: userData.id,
    //   tenantId,
    // }, { transaction }); // Pending cause of department dependency

    const organization = await Organization.findOne({
      where: { id: tenantId },
      transaction,
    });

    const html = getInviteEmailTemplate({
      name: userData.first_name || userData.email.split("@")[0],
      role: "employee",
      companyName: organization?.name || "our organization",
      inviteLink: env.client_url,
      password: data.password,
      email: data.email,
      password: data.password,
    });

    await sendMail(data.email, "Welcome to the team!", html);

    await transaction.commit();

    return {
      success: true,
      data: userData,
      message: "User Registered Successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getIPService = async (adminUser) => {
  try {
    const ips = await UserIP.findAll({
      where: { tenantId: requireTenantId(adminUser) },
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("ipAddress")), "ipAddress"],
        "isBlocked",
        "failedLogInAttempt",
      ],
      raw: true,
    });
    return {
      success: true,
      data: ips,
      message: "IPs fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
