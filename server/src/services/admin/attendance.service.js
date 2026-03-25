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

export const getAttendance = async (filters = {}, adminUser) => {
  try {
    const tenantId = requireTenantId(adminUser);
    const { status, role, requestedTo, page = 1, limit = 10 } = filters;

    const where = { tenantId };
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

export const approveAttendanceRequest = async (adminUser, id) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(adminUser);
    const attendanceData = await AttendanceRequest.findOne({
      where: {
        id: id,
        status: "PENDING",
        tenantId,
        requestedTo: adminUser.id,
      },
      include: [
        { model: Attendance },
        {
          model: User,
          as: "requester",
          attributes: ["email", "role"],
          required: true,
        },
      ],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Data Not Found");
    }

    const attendance = attendanceData.Attendance;

    if (attendanceData.Attendance.punchOutAt == null) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You can't approved attendance before punch out",
      );
    }

    attendance.status = "APPROVED";
    attendance.approvedBy = adminUser.id;
    attendance.approvedAt = new Date();
    await attendance.save({ transaction });

    attendanceData.status = "APPROVED";
    attendanceData.reviewedBy = adminUser.id;
    attendanceData.reviewedAt = new Date();

    await attendanceData.save({ transaction });

    await transaction.commit();

    const admin = await User.findOne({
      where: getScopedWhere(adminUser, { id: adminUser.id }),
      attributes: ["email"],
    });

    const html = attendanceApprovedMailTemplate({
      userName: attendanceData.requester.email.split("@")[0],
      managerName: admin.email.split("@")[0],
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

export const rejectAttendanceRequest = async (adminUser, id, data) => {
  try {
    const tenantId = requireTenantId(adminUser);
    const attendanceData = await AttendanceRequest.findOne({
      where: {
        id: id,
        status: "PENDING",
        tenantId,
        requestedTo: adminUser.id,
      },
      include: [
        { model: Attendance, attributes: ["punchOutAt", "punchInAt"] },
        {
          model: User,
          as: "requester",
          attributes: ["email", "role"],
          required: true,
        },
      ],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Data Found");
    }

    if (
      !attendanceData.Attendance.punchOutAt ||
      !attendanceData.Attendance.punchInAt
    ) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You can't reject attendance before punch out",
      );
    }

    attendanceData.status = "REJECTED";
    attendanceData.reviewedBy = adminUser.id;
    attendanceData.reviewedAt = new Date();
    attendanceData.remark = data.remark;

    await attendanceData.save();

    const admin = await User.findOne({
      where: getScopedWhere(adminUser, { id: adminUser.id }),
      attributes: ["email"],
    });

    const html = attendanceRejectedMailTemplate({
      userName: attendanceData.requester.email.split("@")[0],
      managerName: admin.email.split("@")[0],
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

export const bulkAttendanceRequestApprove = async ({ ids }, adminUser) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(adminUser);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You have to select atleast one request",
      );
    }

    const requests = await AttendanceRequest.findAll({
      where: { id: ids, status: "PENDING", tenantId, requestedTo: adminUser.id },
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
        "Some requests are not pending or not found",
      );
    }

    const hasIncomplete = requests.some((r) => !r.Attendance?.punchOutAt);

    if (hasIncomplete) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Cannot approve — some requests have no punch out",
      );
    }

    await AttendanceRequest.update(
      {
        status: "APPROVED",
        reviewedBy: adminUser.id,
      },
      {
        where: { id: ids, status: "PENDING", tenantId, requestedTo: adminUser.id },
      },
      { transaction },
    );

    const attendanceIds = requests.map((r) => r.Attendance.id);

    await Attendance.update(
      {
        status: "APPROVED",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
      },
      {
        where: { id: attendanceIds, tenantId },
      },
      { transaction },
    );

    await transaction.commit();

    return {
      success: true,
      message: "Request Approved Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const bulkAttendanceRequestReject = async ({ ids, remark }, adminUser) => {
  try {
    const tenantId = requireTenantId(adminUser);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You have to select atleast one request",
      );
    }

    if (!remark?.trim()) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Remark is required");
    }

    const requests = await AttendanceRequest.findAll({
      where: { id: ids, status: "PENDING", tenantId, requestedTo: adminUser.id },
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
        "Some requests are not pending or not found",
      );
    }

    const hasIncomplete = requests.some((r) => !r.Attendance?.punchOutAt);

    if (hasIncomplete) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Cannot reject — some requests have no punch out",
      );
    }

    await AttendanceRequest.update(
      {
        status: "REJECTED",
        remark,
        reviewedBy: adminUser.id,
      },
      {
        where: { id: ids, status: "PENDING", tenantId, requestedTo: adminUser.id },
      },
    );

    return {
      success: true,
      message: "Attendance Request rejected successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
