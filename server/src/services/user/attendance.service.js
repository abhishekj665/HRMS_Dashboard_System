import STATUS from "../../constants/Status.js";
import {
  Attendance,
  User,
  AttendanceRequest,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { requireTenantId } from "../../utils/tenant.utils.js";

export const getAttendance = async (filters = {}, user) => {
  try {
    const tenantId = requireTenantId(user);
    const { status, page = 1, limit = 10 } = filters;

    

    const where = { requestedBy: user.id, tenantId };
    if (status) where.status = status.toUpperCase();

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await AttendanceRequest.findAndCountAll({
      where,
      attributes: [
        "id",
        "attendanceId",
        "requestType",
        "status",
        "reviewedBy",
        "reviewedAt",
        "createdAt",
      ],
      include: [
        {
          model: Attendance,
          attributes: [
            "punchInAt",
            "punchOutAt",
            "workedMinutes",
            "breakMinutes",
            "overtimeMinutes",
          ],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    return {
      success: true,
      data: rows,
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      message: "Attendance Data Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const pendingAttendanceRequests = async (user) => {
  try {
    const tenantId = requireTenantId(user);
    const attendanceData = await AttendanceRequest.findAll({
      where: { requestedBy: user.id, tenantId, status: "PENDING" },
    });

    if (!attendanceData) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "No pending attendance record found",
      );
    }

    return {
      success: true,
      data: attendanceData,
      message: "Data Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const approvedAttendanceRequest = async (user) => {
  try {
    const tenantId = requireTenantId(user);
    const attendanceData = await AttendanceRequest.findAll({
      where: { requestedBy: user.id, tenantId, status: "APPROVED" },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Data Found",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectedAttendanceRequest = async (user) => {
  try {
    const tenantId = requireTenantId(user);
    const attendanceData = await AttendanceRequest.findAll({
      where: { requestedBy: user.id, tenantId, status: "REJECTED" },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Data Found",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
