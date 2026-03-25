import STATUS from "../../constants/Status.js";
import {
  Attendance,
  AttendanceRequest,
  User,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import {
  attendanceApprovedMailTemplate,
  attendanceRejectedMailTemplate,
} from "../../utils/attendanceMail.utils.js";
import { sendMail } from "../../config/otpService.js";
import { sequelize } from "../../config/db.js";
import {
  getScopedWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const getAllAttendance = async (filters = {}, manager) => {
  try {
    const tenantId = requireTenantId(manager);
    const { status, role, page = 1, limit = 10 } = filters;

    const where = { tenantId, requestedTo: manager.id };
    if (status) where.status = status.toUpperCase();

    const requesterWhere = {};
    if (role) requesterWhere.role = role;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await AttendanceRequest.findAndCountAll({
      where,
      attributes: ["id", "reviewedBy", "requestedTo", "status", "createdAt"],
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

export const getAttendance = async (filters = {}, manager) => {
  try {
    const tenantId = requireTenantId(manager);
    const { status, role, page = 1, limit = 10 } = filters;

    const where = { tenantId, requestedBy: manager.id };
    if (status) where.status = status.toUpperCase();

    const requesterWhere = {};
    if (role) requesterWhere.role = role;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await AttendanceRequest.findAndCountAll({
      where,
      attributes: ["id", "reviewedBy", "requestedTo", "status", "createdAt"],
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
          attributes: ["id", "email", "role"],
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

export const approveAttendanceRequest = async (manager, id) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(manager);
    const attendanceData = await AttendanceRequest.findOne({
      where: { id: id, status: "PENDING", tenantId, requestedTo: manager.id },
      include: [
        { model: Attendance },
        { model: User, as: "requester", attributes: ["email", "role"] },
      ],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Data Not Found");
    }

    const attendance = attendanceData.Attendance;

    if (
      !attendanceData.Attendance.punchOutAt ||
      !attendanceData.Attendance.punchInAt
    ) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You can't approved attendance before punch out",
      );
    }

    attendance.status = "APPROVED";
    attendance.approvedBy = manager.id;
    attendance.approvedAt = new Date();
    await attendance.save({ transaction });

    attendanceData.status = "APPROVED";
    attendanceData.reviewedBy = manager.id;
    attendanceData.reviewedAt = new Date();

    await attendanceData.save({ transaction });

    await transaction.commit();

    const managerData = await User.findOne({
      where: getScopedWhere(manager, { id: manager.id }),
      attributes: ["email"],
    });

    const html = attendanceApprovedMailTemplate({
      userName: attendanceData.requester.email.split("@")[0],
      managerName: managerData.email.split("@")[0],
      date: new Date().toLocaleString("en-IN"),
      punchInTime: attendanceData.Attendance.punchInAt,
      punchOutTime: attendanceData.Attendance.punchOutAt,
      remark: "Your attendance is approved",
    });

    sendMail(attendanceData.requester.email, "Attendance Approved", html);

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Approved Succussfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectAttendanceRequest = async (manager, id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(manager);
    const attendanceData = await AttendanceRequest.findOne({
      where: { id: id, status: "PENDING", tenantId, requestedTo: manager.id },
      include: [
        { model: Attendance, attributes: ["punchOutAt", "punchInAt"] },
        { model: User, as: "requester", attributes: ["email", "role"] },
      ],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Data Found");
    }

    const attendance = attendanceData.Attendance;

    if (
      !attendanceData.Attendance.punchOutAt ||
      !attendanceData.Attendance.punchInAt
    ) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You can't reject attendance before punch out",
      );
    }

    attendance.status = "APPROVED";
    attendance.approvedBy = manager.id;
    attendance.approvedAt = new Date();
    await attendance.save({ transaction });

    attendanceData.reviewedBy = manager.id;
    attendanceData.reviewedAt = new Date();
    attendanceData.status = "REJECTED";
    attendanceData.remark = data.remark;

    await attendanceData.save({ transaction });

    await transaction.commit();

    const managerData = await User.findOne({
      where: getScopedWhere(manager, { id: manager.id }),
      attributes: ["email"],
    });

    const html = attendanceRejectedMailTemplate({
      userName: attendanceData.requester.email.split("@")[0],
      managerName: managerData.email.split("@")[0],
      date: new Date().toLocaleString("en-IN"),
      punchInTime: attendanceData.Attendance.punchInAt,
      punchOutTime: attendanceData.Attendance.punchOutAt,
      remark: data.remark,
    });

    sendMail(attendanceData.requester.email, "Attendance Rejected", html);

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Rejected Successfully ",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const bulkAttendanceRequestReject = async (
  { ids, remark },
  manager,
) => {
  try {
    const tenantId = requireTenantId(manager);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You have to select at least one request",
      );
    }

    if (!remark?.trim()) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Remark is required");
    }

    const requests = await AttendanceRequest.findAll({
      where: { id: ids, status: "PENDING", tenantId, requestedTo: manager.id },
      include: [
        {
          model: Attendance,
          attributes: ["id", "punchOutAt"],
        },
      ],
    });

    if (requests.length !== ids.length) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Some requests not found or not pending",
      );
    }

    const hasIncomplete = requests.some((r) => !r.Attendance?.punchOutAt);

    if (hasIncomplete) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Cannot reject — some records have no punch out",
      );
    }

    await AttendanceRequest.update(
      {
        status: "REJECTED",
        remark,
        reviewedBy: manager.id,
      },
      {
        where: { id: ids, status: "PENDING", tenantId, requestedTo: manager.id },
      },
    );

    return {
      success: true,
      message: "Rejected successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const bulkAttendanceRequestApprove = async ({ ids }, manager) => {
  try {
    const tenantId = requireTenantId(manager);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You have to select at least one request",
      );
    }

    const requests = await AttendanceRequest.findAll({
      where: { id: ids, status: "PENDING", tenantId, requestedTo: manager.id },
      include: [
        {
          model: Attendance,
          attributes: ["id", "punchOutAt"],
        },
      ],
    });

    if (requests.length !== ids.length) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Some requests not found or not pending",
      );
    }

    const hasIncomplete = requests.some((r) => !r.Attendance?.punchOutAt);

    if (hasIncomplete) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Cannot approve — some records have no punch out",
      );
    }

    const attendanceIds = requests.map((r) => r.Attendance.id);

    await Attendance.update(
      {
        status: "APPROVED",
        approvedBy: manager.id,
        approvedAt: new Date(),
      },
      {
        where: { id: attendanceIds, tenantId },
      },
    );

    await AttendanceRequest.update(
      {
        status: "APPROVED",
        reviewedBy: manager.id,
        reviewedAt: new Date(),
      },
      {
        where: { id: ids, status: "PENDING", tenantId, requestedTo: manager.id },
      },
    );

    return {
      success: true,
      message: "Approved successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
