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
import {
  getLeaveApprovedTemplate,
  getLeaveRejectedTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { getScopedWhere, requireTenantId } from "../../utils/tenant.utils.js";

export const approveLeaveRequest = async (id, manager) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(manager);
    const leaveData = await LeaveRequest.findOne({
      where: { id, tenantId },
      include: [
        { model: LeaveAuditLog, as: "auditLogs", required: false },
        {
          model: User,
          where: { role: "employee", managerId: manager.id, tenantId },
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
          attributes: ["id", "name", "code"],
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
        reviewedBy: manager.id,
        reviewedAt: new Date(),
        remark: "Approved By Manager",
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
        reviewedBy: manager.id,
      },
      { transaction },
    );

    const managerData = await User.findOne({
      where: getScopedWhere(manager, { id: manager.id }),
      attributes: ["email"],
      raw: true,
    });

    const html = getLeaveApprovedTemplate({
      managerName: managerData?.email.split("@")[0],
      employeeName:
        leaveData.employee?.first_name ||
        leaveData.employee?.email.split("@")[0],
      leaveType: leaveData.LeaveType.name,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysRequested: leaveData.daysRequested,
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

export const rejectLeaveRequest = async (id, remark, manager) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = requireTenantId(manager);
    const leaveData = await LeaveRequest.findOne({
      where: { id, tenantId },
      include: [
        { model: LeaveAuditLog, as: "auditLogs", required: true },
        {
          model: User,
          where: { role: "employee", managerId: manager.id, tenantId },
          as: "employee",
          required: true,
        },
        {
          model: LeaveType,
          as: "LeaveType",
          attributes: ["id", "name", "code"],
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
        reviewedBy: manager.id,
        reviewedAt: new Date(),
        reviewedBy: manager.id,
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
        reviewedBy: manager.id,
      },
      { transaction },
    );

    const managerData = await User.findOne({
      where: getScopedWhere(manager, { id: manager.id }),
      attributes: ["email"],
      raw: true,
    });


    const html = getLeaveRejectedTemplate({
      managerName: managerData?.email.split("@")[0],
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
  manager,
) => {
  try {
    const tenantId = requireTenantId(manager);
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
          where: { role: "employee", managerId: manager.id, tenantId },
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
