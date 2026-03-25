import {
  User,
  LeaveBalance,
  LeaveType,
  LeavePolicy,
  LeavePolicyRule,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";
import { requireTenantId } from "../../utils/tenant.utils.js";

export const assignLeaveBalance = async (userId, year, user) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(user);
    const scopedUser = await User.findOne({
      where: { id: userId, tenantId },
      transaction,
    });

    if (!scopedUser) throw new Error("User not found");
    if (!scopedUser.leavePolicyId) throw new Error("User has no policy assigned");

    const rules = await LeavePolicyRule.findAll({
      where: { policyId: scopedUser.leavePolicyId, tenantId },
      transaction,
    });

    if (!rules.length) {
      throw new Error("No rules found for this policy");
    }

    const existingBalances = await LeaveBalance.findAll({
      where: {
        userId,
        tenantId,
        year,
      },
      transaction,
    });

    const existingMap = {};
    existingBalances.forEach((b) => {
      existingMap[b.leaveTypeId] = b;
    });

    const balancesToInsert = rules.map((rule) => {
      const existing = existingMap[rule.leaveTypeId];

      const used = existing ? existing.used : 0;
      const totalAllocated = rule.quotaPerYear;
      const balance = Math.max(0, totalAllocated - used);

      return {
        id: existing ? existing.id : undefined,
        userId,
        tenantId,
        leaveTypeId: rule.leaveTypeId,
        totalAllocated,
        used,
        balance,
        year,
        policyId: rule.policyId,
      };
    });

    await LeaveBalance.bulkCreate(balancesToInsert, {
      updateOnDuplicate: ["totalAllocated", "balance", "updatedAt"],
      transaction,
    });

    await transaction.commit();

    return {
      success: true,
      message: "Leave balances assigned successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const assignLeaveBalanceBulk = async (policyId, year, user, transaction) => {
  try {
    const tenantId = requireTenantId(user);
    const currentYear = Number(year) || new Date().getFullYear();

    const policy = await LeavePolicy.findOne({
      where: { id: policyId, tenantId },
      transaction,
    });
    if (!policy) throw new Error("Policy not found");

    const users = await User.findAll({
      where: { leavePolicyId: policyId, tenantId },
      attributes: ["id"],
      transaction,
    });

    if (!users.length) {
      throw new Error("No users found under this policy");
    }

    const rules = await LeavePolicyRule.findAll({
      where: { policyId, tenantId },
      transaction,
    });

    if (!rules.length) {
      throw new Error("No rules found for this policy");
    }

    const existingBalances = await LeaveBalance.findAll({
      where: {
        userId: users.map((u) => u.id),
        tenantId,
        year: currentYear,
      },
      transaction,
    });

    const balanceMap = {};
    existingBalances.forEach((b) => {
      balanceMap[`${b.userId}_${b.leaveTypeId}`] = b;
    });

    const balancesToUpsert = [];

    for (const user of users) {
      for (const rule of rules) {
        const key = `${user.id}_${rule.leaveTypeId}`;
        const existing = balanceMap[key];

        const used = existing ? existing.used : 0;
        const totalAllocated = rule.quotaPerYear;
        const balance = Math.max(0, totalAllocated - used);

        balancesToUpsert.push({
          id: existing ? existing.id : undefined,
          userId: user.id,
          tenantId,
          leaveTypeId: rule.leaveTypeId,
          totalAllocated,
          used,
          balance,
          year: currentYear,
          policyId,
        });
      }
    }

    await LeaveBalance.bulkCreate(balancesToUpsert, {
      updateOnDuplicate: ["totalAllocated", "balance", "updatedAt"],
      transaction,
    });

    return {
      success: true,
      message: "Leave balances generated/updated successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getLeaveBalance = async (user) => {
  try {
    const leaveData = await LeaveBalance.findAll({
      where: { userId: user.id, tenantId: requireTenantId(user) },
      attributes: [
        "balance",
        "policyId",
        "userId",
        "used",
        "totalAllocated",
        "year",
        "leaveTypeId",
      ],
      include: [
        {
          model: LeaveType,
          attributes: ["name", "code", "id"],
          required: true,
        },
      ],
    });

    if (!leaveData || leaveData.length === 0) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Leave Data Found");
    }

    return {
      success: true,
      data: leaveData,
      message: "Leave Balance Data Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
