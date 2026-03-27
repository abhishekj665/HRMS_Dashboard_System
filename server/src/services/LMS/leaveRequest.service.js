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
import { getScopedWhere, requireTenantId } from "../../utils/tenant.utils.js";

export const registerLeaveRequest = async (data, authUser) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(authUser);
    const dayRequested = calculateLeaveDays(
      data.startDate,
      data.endDate,
      data.isHalfDay,
    );

    

    data.daysRequested = dayRequested;

    const { leaveTypeId } = data;

    const user = await User.findOne({
      where: { id: authUser.id, tenantId },
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
                  attributes: ["isActive", "name", "code", "requiresApproval"],
                },
              ],
            },
          ],
        },
        {
          model: LeaveBalance,
          as: "leaveBalances",
          where: { leaveTypeId, tenantId },
        },
      ],
    });

    if(user.role === "employee" && user.managerId === null){
      throw new ExpressError(STATUS.BAD_REQUEST, "No manager assigned to your profile. Please contact Admin."
      );
    }

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
        userId: authUser.id,
        tenantId,
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

    const leaveType = await LeaveType.findOne({
      where: { id: leaveTypeId, tenantId },
    });

    

    if (leaveType.requiresApproval && !user.manager) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "This leave type requires manager approval, but no manager is assigned to your profile. Please contact HR.",
      );
    }

    if (!leaveType.requiresApproval) {
      data.status = "APPROVED";

      const leaveBalance = await LeaveBalance.findOne({
        where: { leaveTypeId, userId: authUser.id, tenantId },
      });

      leaveBalance.balance -= data.daysRequested;
      await leaveBalance.save({ transaction });
    }

    

    const leaveData = await LeaveRequest.create(
      {
        ...data,
        tenantId,
        userId: authUser.id,
      },
      { transaction },
    );

    await LeaveAuditLog.create(
      {
        leaveRequestId: leaveData.id,
        tenantId,
        newStatus: leaveData.status,
        action: "APPLIED",
      },
      { transaction },
    );


    
    let admin = null;

    if (user.role === "manager") {
      admin = await User.findOne({
        where: getScopedWhere(authUser, { role: "admin" }),
        attributes: ["email"],
        raw: true,
      });
    }

    

    await transaction.commit();

  

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

export const getLeaveRequest = async (user) => {
  try {
    const leaveData = await LeaveRequest.findAll({
      where: { userId: user.id, tenantId: requireTenantId(user) },
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
