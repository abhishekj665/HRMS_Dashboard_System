import {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  User,
  LeavePolicy,
  LeavePolicyRule,
  LeaveAuditLog,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";
import { calculateLeaveDays } from "../../utils/calulateLeaveDays.utils.js";
import { Op } from "sequelize";
import {
  getLeaveRejectedTemplate,
  getLeaveRequestCreatedTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";

export const registerLeaveRequest = async (data, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const dayRequested = calculateLeaveDays(
      data.startDate,
      data.endDate,
      data.isHalfDay,
    );

    data.daysRequested = dayRequested;

    const { leaveTypeId } = data;

    const user = await User.findByPk(userId, {
      include: [
        { model: User, as: "manager", attributes: ["first_name", "email"] },
        {
          model: LeavePolicy,
          as: "leavePolicy",
          include: [
            {
              model: LeavePolicyRule,
              as: "rules",
              include: [
                {
                  model: LeaveType,
                  as: "leaveType",
                  attributes: ["isActive", "name", "code"],
                },
              ],
            },
          ],
        },
        {
          model: LeaveBalance,
          as: "leaveBalances",
          where: { leaveTypeId },
        },
      ],
    });

    if (!user || !user.leavePolicy)
      throw new ExpressError(STATUS.BAD_REQUEST, "No policy found");

    const policy = user.leavePolicy;

    if (!policy.isActive) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Assigned leave policy is inactive",
      );
    }

    const requestStart = new Date(data.startDate);
    const requestEnd = new Date(data.endDate);
    const effectiveFrom = new Date(policy.effectiveFrom);
    const effectiveTo = new Date(policy.effectiveTo);

    if (requestStart < effectiveFrom || requestEnd > effectiveTo) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        `Leave request must be within policy effective period (${policy.effectiveFrom} - ${policy.effectiveTo})`,
      );
    }

    if (
      !user.leavePolicy.isActive ||
      !user.leavePolicy.rules ||
      !user.leavePolicy.rules[0].leaveType.isActive
    )
      throw new ExpressError(STATUS.BAD_REQUEST, "No active policy found");

    if (user.leaveBalances?.[0]?.balance < data.daysRequested)
      throw new ExpressError(STATUS.BAD_REQUEST, "Insufficient leave balance");

    const overlappingLeave = await LeaveRequest.findOne({
      where: {
        userId,
        status: {
          [Op.in]: ["PENDING", "APPROVED"],
        },
        startDate: {
          [Op.lte]: data.endDate,
        },
        endDate: {
          [Op.gte]: data.startDate,
        },
      },
    });

    if (overlappingLeave) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You already have a leave request for the selected date range",
      );
    }

    const leaveData = await LeaveRequest.create(
      {
        ...data,
        userId: userId,
        status: "pending",
      },
      { transaction },
    );

    await LeaveAuditLog.create(
      {
        leaveRequestId: leaveData.id,
        newStatus: "PENDING",
        action: "APPLIED",
      },
      { transaction },
    );

    let admin = null;

    if (user.role === "manager") {
      admin = await User.findOne({
        where: { role: "admin" },
        attributes: ["email"],
        raw: true,
      });
    }


    const html = getLeaveRequestCreatedTemplate({
      managerName:
        user?.manager?.email?.split("@")[0] || admin?.email?.split("@")[0],
      employeeName: user?.first_name || user?.email?.split("@")[0],
      leaveType: user.leavePolicy.rules[0].leaveType.name,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysRequested: leaveData.daysRequested,
      reason: leaveData.reason,
    });

    if (admin) {
      sendMail(admin.email, "New Leave Request", html);
    } else sendMail(user.manager.email, "New Leave Request", html);

    await transaction.commit();

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Registered Successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const cancelLeaveRequest = async (id, data, userId) => {
  try {
    const leaveData = await LeaveRequest.findByPk(id);

    if (!leaveData || leaveData.userId !== userId) {
      return {
        success: false,
        messsage: "Leave Not Found",
      };
    }

    if (leaveData.status !== "Pending") {
      return {
        success: false,
        message: "You can't cancel this request",
      };
    }

    await leaveData.update(data);

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Cancelled Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const extendLeaveRequest = async (id, data, userId) => {
  try {
    const leaveData = await LeaveRequest.findByPk(id);

    const leaveType = LeaveType.findByPk(leaveData.leaveTypeId);

    if (!leaveType.carryForwardAllowed || leaveType.carryForwardLimit === 0) {
      return {
        success: false,
        message: "You can extend you request",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getLeaveRequest = async (useId) => {
  try {
    const leaveData = await LeaveRequest.findAll({
      where: { userId: useId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: LeaveType,
          attributes: ["name", "code", "id"],
          required: true,
        },
      ],
    });

    if (!leaveData)
      return {
        success: false,
        message: "No Leave Data Found",
      };

    return {
      success: true,
      data: leaveData,
      message: "Leave Data Found",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
