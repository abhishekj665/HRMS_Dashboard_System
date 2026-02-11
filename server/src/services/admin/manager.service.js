import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { User , AttendancePolicy} from "../../models/Associations.model.js";
import { generateHash } from "../../utils/hash.utils.js";
import { sequelize } from "../../config/db.js";

export const getAllManagers = async () => {
  try {
    const managerData = await User.findAll({ where: { role: "manager" } });

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

export const registerManagerService = async (data) => {
  try {
    const { email, password } = data;

    const hashedPassword = await generateHash(password);

    const attendancePolicy = await AttendancePolicy.findOne({
      where: { isDefault: true },
    });

    const managerData = await User.create({
      first_name: data.first_name || "Manager2",
      last_name: data.last_name || "",
      email,
      contact: data.contact || 0,
      password: hashedPassword,
      role: "manager",
      attendancePolicyId : attendancePolicy.id
    });

    return {
      success: true,
      data: managerData,
      message: "Message Register Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const assignWorkersToManagerService = async ({
  managerId,
  workerIds,
}) => {
  const transaction = await sequelize.transaction();

  try {
    if (!managerId || !workerIds?.length) {
      throw new ExpressError(400, "ManagerId and workerIds are required");
    }

    const manager = await User.findOne({
      where: { id: managerId, role: "manager" },
      transaction,
    });

    if (!manager) {
      throw new ExpressError(404, "Manager not found");
    }

    const workers = await User.findAll({
      where: { id: workerIds, role: "user" },
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

export const getManagersWithUsersService = async () => {
  const managers = await User.findAll({
    where: { role: "manager" },
    attributes: ["id", "email", "first_name", "last_name"],
    include: [
      {
        model: User,
        as: "workers",
        attributes: ["id", "email", "first_name", "last_name"],
      },
    ],
  });

  return {
    success: true,
    data: managers,
  };
};
