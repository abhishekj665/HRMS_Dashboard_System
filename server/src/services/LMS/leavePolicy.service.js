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

export const registerLeavePolicy = async (data, adminId) => {
  const t = await sequelize.transaction();

  try {
    const { rules, ...policyData } = data;

    

    const policy = await LeavePolicy.create(
      {
        ...policyData,
        createdBy: adminId,
      },
      { transaction: t },
    );

    console.log("Saved policy:", policy.toJSON());

    for (const r of rules) {
      await LeavePolicyRule.create(
        {
          ...r,
          policyId: policy.id,
        },
        { transaction: t },
      );
    }

    console.log(policy.appliesTo);


    await assignPolicyBulk(policy.id, policy.appliesTo, policy.year, t);

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

export const updateLeavePolicy = async (id, data, adminId) => {
  const t = await sequelize.transaction();

  console.log(data);

  try {
    const { rules = [], ...policyData } = data;

    const policy = await LeavePolicy.findOne({
      where: { id, createdBy: adminId },
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
          leaveTypeId: rule.leaveTypeId,
          quotaPerYear: rule.quotaPerYear,
          carryForwardAllowed: rule.carryForwardAllowed,
          carryForwardLimit: rule.carryForwardLimit,
        },
        { transaction: t },
      );
    }

    await assignPolicyBulk(id, policy.appliesTo, policy.year, t);

    await t.commit();

    return { success: true, message: "Policy Updated Successfully" };
  } catch (error) {
    await t.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const deleteLeavePolicy = async (id) => {
  try {
    const policy = await LeavePolicy.destroy({ where: { id } });

    return {
      success: true,
      data: policy,
      message: "Policy Deleted Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getLeavePolicies = async () => {
  try {
    const policies = await LeavePolicy.findAll({
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

export const assignPolicyToUser = async (userId, policyId, year) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) throw new ExpressError(STATUS.NOT_FOUND, "User not found");

    await user.update({ leavePolicyId: policyId }, { transaction });

    await transaction.commit();

    await assignLeaveBalance(userId, year);

    return {
      success: true,
      message: "Policy assigned successfully to user",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const assignPolicyBulk = async (policyId, filter, year, transaction) => {
  if (filter === "all") filter = {};
  if (filter == "user") filter = { role: "user" };
  if (filter == "manager") filter = { role: "manager" };

  try {
    const [affectedRows] = await User.update(
      { leavePolicyId: policyId },
      {
        where: {
          ...filter,
        },
        transaction,
      },
    );

    if (!affectedRows)
      throw new ExpressError(STATUS.NOT_FOUND, "No users matched the filter");

    await assignLeaveBalanceBulk(policyId, year, transaction);

    return {
      success: true,
      message: "Policy assigned successfully to users",
      affectedUsers: affectedRows,
    };
  } catch (error) {
    throw error;
  }
};
