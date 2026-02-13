import ExpressError from "../../utils/Error.utils.js";
import { AttendancePolicy, UserIP } from "../../models/Associations.model.js";
import { User } from "../../models/Associations.model.js";
import { getPagination } from "../../utils/paginations.utils.js";
import STATUS from "../../constants/Status.js";
import { generateHash } from "../../utils/hash.utils.js";
import { Attendance } from "../../models/Associations.model.js";

export const getUsersService = async (page, limits, user) => {
  try {
    const { limit, offset } = getPagination(page, limits);

    const { count, rows } = await User.findAndCountAll({
      distinct: true,
      limit,
      offset,
      where: { managerId: user.id },
      attributes: ["id", "isVerified", "isBlocked", "email", "role"],
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "email", "first_name", "last_name"],
        },
      ],
    });

    return {
      success: true,
      data: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new ExpressError(400, error.message);
  }
};

export const registerUserService = async ({ data }) => {
  try {
    if (!data.email || !data.password) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    let hashedPassword = await generateHash(data.password);

    const attendancePolicy = await AttendancePolicy.findOne({
      where: { isDefault: true },
    });

    const userData = await User.create({
      ...data,
      password: hashedPassword,
      attendancePolicyId: attendancePolicy.id,
    });

    return {
      success: true,
      data: userData,
      message: "User Registered Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
