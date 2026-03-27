import {
  LeavePolicy,
  LeavePolicyRule,
  LeaveType,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";
import {
  assignLeaveBalance,
  assignLeaveBalanceBulk,
} from "../LMS/leaveBalance.service.js";
import { User } from "../../models/Associations.model.js";
import {
  getScopedWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const registerLeavePolicy = async (data, adminUser) => {
  const t = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(adminUser);
    const { rules, ...policyData } = data;

    

    const policy = await LeavePolicy.create(
      {
        ...policyData,
        tenantId,
        createdBy: adminUser.id,
      },
      { transaction: t },
    );

    

    for (const r of rules) {
      await LeavePolicyRule.create(
        {
          ...r,
          tenantId,
          policyId: policy.id,
        },
        { transaction: t },
      );
    }


    if(policy.isActive) {
      await assignPolicyBulk(policy.id, policy.appliesTo, policy.year, adminUser, t);
    }

    await t.commit();

    return {
      success: true,
      data: policy,
      message: "Policy Registered Successfully",
    };
  } catch (error) {
    await t.rollback();

    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const updateLeavePolicy = async (id, data, adminUser) => {
  const t = await sequelize.transaction();

  

  try {
    const tenantId = requireTenantId(adminUser);
    const { rules = [], ...policyData } = data;

    const policy = await LeavePolicy.findOne({
      where: { id, tenantId, createdBy: adminUser.id },
      transaction: t,
    });

    if (!policy) {
      await t.rollback();
      return { success: false, message: "Policy Not Found" };
    }

    if (Object.keys(policyData).length > 0) {
      await policy.update(policyData, { transaction: t });
    }

    for (const rule of rules) {
      await LeavePolicyRule.upsert(
        {
          policyId: id,
          tenantId,
          leaveTypeId: rule.leaveTypeId,
          quotaPerYear: rule.quotaPerYear,
          carryForwardAllowed: rule.carryForwardAllowed,
          carryForwardLimit: rule.carryForwardLimit,
        },
        { transaction: t },
      );
    }

    await assignPolicyBulk(id, policy.appliesTo, policy.year, adminUser, t);

    await t.commit();

    return { success: true, message: "Policy Updated Successfully" };
  } catch (error) {
    await t.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const deleteLeavePolicy = async (id, adminUser) => {
  try {
    const policy = await LeavePolicy.destroy({
      where: getScopedWhere(adminUser, { id }),
    });

    return {
      success: true,
      data: policy,
      message: "Policy Deleted Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getLeavePolicies = async (adminUser) => {
  try {
    const policies = await LeavePolicy.findAll({
      where: { tenantId: requireTenantId(adminUser) },
      include: [
        {
          model: LeavePolicyRule,
          as: "rules",
          include: [{ model: LeaveType, as: "leaveType" }],
        },
      ],
    });

    return {
      success: true,
      data: policies,
      message: "Policies Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const assignPolicyToUser = async (userId, policyId, year, adminUser) => {
  const transaction = await sequelize.transaction();

  try {
    const tenantId = requireTenantId(adminUser);
    const user = await User.findOne({
      where: { id: userId, tenantId },
      transaction,
    });

    if (!user) throw new ExpressError(STATUS.NOT_FOUND, "User not found");

    const policy = await LeavePolicy.findOne({
      where: { id: policyId, tenantId },
      transaction,
    });

    if (!policy) throw new ExpressError(STATUS.NOT_FOUND, "Policy not found");

    await user.update({ leavePolicyId: policyId }, { transaction });

    await transaction.commit();

    await assignLeaveBalance(userId, year, adminUser);

    return {
      success: true,
      message: "Policy assigned successfully to user",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const assignPolicyBulk = async (
  policyId,
  filter,
  year,
  adminUser,
  transaction = null,
) => {
  const ownTransaction = transaction || (await sequelize.transaction());
  if (filter === "all") filter = {};
  if (filter == "employee") filter = { role: "employee" };
  if (filter == "manager") filter = { role: "manager" };

  try {
    const tenantId = requireTenantId(adminUser);
    const policy = await LeavePolicy.findOne({
      where: { id: policyId, tenantId },
      transaction: ownTransaction,
    });

    if (!policy)
      throw new ExpressError(STATUS.NOT_FOUND, "Policy not found");

    if (!policy.isActive) {
      if (!transaction) {
        await ownTransaction.commit();
      }
      return {
        success: true,
        message: "Policy is inactive, no users were assigned",
        affectedUsers: 0,
      };
    }

    const [affectedRows] = await User.update(
      { leavePolicyId: policyId },
      {
        where: {
          tenantId,
          ...filter,
        },
        transaction: ownTransaction,
      },
    );

    if (!affectedRows)
      throw new ExpressError(STATUS.NOT_FOUND, "No users matched the filter");

    await assignLeaveBalanceBulk(policyId, year, adminUser, ownTransaction);

    if (!transaction) {
      await ownTransaction.commit();
    }

    return {
      success: true,
      message: "Policy assigned successfully to users",
      affectedUsers: affectedRows,
    };
  } catch (error) {
    if (!transaction) {
      await ownTransaction.rollback();
    }
    throw error;
  }
};
