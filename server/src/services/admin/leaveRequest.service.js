import STATUS from "../../constants/Status.js";
import ExpressError from "../../utils/Error.utils.js";
import {
  LeaveAuditLog,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  User,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import { sendMail } from "../../config/otpService.js";
import {
  getLeaveApprovedTemplate,
  getLeaveRejectedTemplate,
} from "../../utils/mailTemplate.utils.js";
import {
  getScopedWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const approveLeaveRequest = async (id, adminUser) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(adminUser);
    const leaveData = await LeaveRequest.findOne({
      where: { id, tenantId },
      include: [
        { model: LeaveAuditLog, as: "auditLogs", required: false },
        {
          model: User,
          where: { role: "manager", tenantId },
          as: "employee",
          required: true,
          include: [
            {
              model: LeaveBalance,
              as: "leaveBalances",
              required: false,
            },
          ],
        },
        {
          model: LeaveType,
          as: "LeaveType",
          required: true,
        },
      ],
    });

    if (!leaveData)
      throw new ExpressError(STATUS.BAD_REQUEST, "Leave Request Not Found");

   

    if (leaveData.status !== "PENDING" || leaveData.cancelRequest) {
      return {
        success: false,
        message: "You can't approve this request, the action is already done",
      };
    }

    const leaveBalanceData = await LeaveBalance.findOne({
      where: {
        userId: leaveData.userId,
        leaveTypeId: leaveData.leaveTypeId,
        tenantId,
      },
    });

    const remainLeaveDay = leaveBalanceData.balance - leaveData.daysRequested;
    const used = leaveBalanceData.balance - remainLeaveDay;

    await leaveBalanceData.update(
      { balance: remainLeaveDay, used },
      { transaction },
    );

    await leaveData.update(
      {
        status: "APPROVED",
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
        remark: "Approved By Admin",
      },
      { transaction },
    );

    await LeaveAuditLog.create(
      {
        leaveRequestId: leaveData.id,
        tenantId,
        newStatus: "APPROVED",
        action: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: adminUser.id,
      },
      { transaction },
    );

    const admin = await User.findOne({
      where: getScopedWhere(adminUser, { role: "admin" }),
      attributes: ["email"],
      raw: true,
    });

    const html = getLeaveApprovedTemplate({
      managerName: admin?.email?.split("@")[0],
      employeeName:
        leaveData.employee?.first_name ||
        leaveData.employee?.email.split("@")[0],
      leaveType: leaveData.LeaveType.name,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysRequested: leaveData.daysRequested,
      reason: leaveData.reason,
    });

    sendMail(leaveData.employee.email, "Leave Request Approved", html);

    await transaction.commit();

    return {
      success: true,
      data: {
        status: leaveData.status,
      },
      messsage: "Leave Approved Successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectLeaveRequest = async (id, remark, adminUser) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = requireTenantId(adminUser);
    const leaveData = await LeaveRequest.findOne({
      where: { id, tenantId },
      include: [
        { model: LeaveAuditLog, as: "auditLogs", required: false },
        {
          model: User,
          where: { role: "manager", tenantId },
          as: "employee",
          required: true,
        },
        {
          model: LeaveType,
          as: "LeaveType",
          required: true,
        },
      ],
    });

    if (!leaveData)
      throw new ExpressError(STATUS.BAD_REQUEST, "Leave Request Not Found");

    if (leaveData.status !== "PENDING" || leaveData.cancelRequest) {
      return {
        success: false,
        message: "You can't reject this request, the action is already done",
      };
    }

    await leaveData.update(
      {
        status: "REJECTED",
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
        reviewedBy: adminUser.id,
        remark: remark,
      },
      { transaction },
    );

    await LeaveAuditLog.create(
      {
        leaveRequestId: leaveData.id,
        tenantId,
        newStatus: "REJECTED",
        action: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: adminUser.id,
      },
      { transaction },
    );

    const admin = await User.findOne({
      where: getScopedWhere(adminUser, { role: "admin" }),
      attributes: ["email"],
      raw: true,
    });

    const html = getLeaveRejectedTemplate({
      managerName: admin?.email?.split("@")[0],
      employeeName:
        leaveData.employee?.first_name ||
        leaveData.employee?.email.split("@")[0],
      leaveType: leaveData.LeaveType.name,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysRequested: leaveData.daysRequested,
      reason: remark,
    });

    sendMail(leaveData.employee.email, "Leave Request Rejected", html);

    await transaction.commit();

    return {
      success: true,
      data: {
        status: leaveData.status,
      },
      messsage: "Leave Rejected Successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getLeaveRequests = async (
  { status = "PENDING", page = 1, limit = 10 },
  adminUser,
) => {
  try {
    const tenantId = requireTenantId(adminUser);
    const offset = (page - 1) * limit;

    const whereClause = { tenantId };

    if (!status || status === "PENDING") {
      whereClause.status = "PENDING";
    } else if (status === "all") {
      whereClause.status = ["APPROVED", "REJECTED"];
    } else {
      whereClause.status = status.toUpperCase();
    }

    const { rows, count } = await LeaveRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          where: { role: "manager", tenantId },
          as: "employee",
          required: true,
          attributes: ["id", "first_name", "email"],
        },
        {
          model: LeaveType,
          as: "LeaveType",
          attributes: ["id", "name", "code"],
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: Number(limit),
    });

    return {
      success: true,
      data: rows,
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      message: "Leave Requests Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
