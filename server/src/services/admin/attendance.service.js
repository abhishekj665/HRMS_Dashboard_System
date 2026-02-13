import STATUS from "../../constants/Status.js";
import {
  Attendance,
  AttendanceRequest,
  User,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

export const getAttendance = async (filters = {}) => {
  try {
    const { status, role, requestedTo, page = 1, limit = 10 } = filters;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (requestedTo) where.requestedTo = requestedTo;

    const requesterWhere = {};
    if (role) requesterWhere.role = role;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await AttendanceRequest.findAndCountAll({
      attributes: ["id", "reviewedBy", "status", "createdAt"],
      where,
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
      distinct: true,
      include: [
        {
          model: Attendance,
          attributes: [
            "id",
            "punchInAt",
            "punchOutAt",
            "workedMinutes",
            "breakMinutes",
          ],
        },
        {
          model: User,
          as: "requester",
          attributes: ["id", "role", "email"],
          required: true,
          where: Object.keys(requesterWhere).length
            ? requesterWhere
            : undefined,
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "email"],
          required: false,
        },
      ],
    });

    

    return {
      success: true,
      data: rows,
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const approveAttendanceRequest = async (adminId, id) => {
  try {
    const attendanceData = await AttendanceRequest.findOne({
      where: {
        id: id,
        status: "PENDING",
        requestedTo: adminId,
      },
      include: [{ model: Attendance, attributes: ["punchOutAt", "punchInAt"] }],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Data Not Found");
    }

    if (attendanceData.Attendance.punchOutAt == null) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You can't approved attendance before punch out",
      );
    }

    attendanceData.status = "APPROVED";
    attendanceData.reviewedBy = adminId;
    attendanceData.reviewedAt = new Date();

    await attendanceData.save();

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Approved Succussfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectAttendanceRequest = async (adminId, id) => {
  try {
    const attendanceData = await AttendanceRequest.findOne({
      where: {
        id: id,
        status: "PENDING",
        requestedTo: adminId,
      },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Data Found");
    }

    attendanceData.status = "REJECTED";
    attendanceData.reviewedBy = adminId;
    attendanceData.reviewedAt = new Date();

    await attendanceData.save();

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Rejected Successfully ",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
