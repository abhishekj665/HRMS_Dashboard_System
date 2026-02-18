import { LeavePolicy, LeavePolicyRule } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";

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

    for (const r of rules) {
      await LeavePolicyRule.create(
        {
          ...r,
          policyId: policy.id,
        },
        { transaction: t },
      );
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

export const updateLeavePolicy = async (id, data, adminId) => {
  try {
    const { policyRule, ...policyData } = data;

    let policy = await LeavePolicy.findByPk(id);

    if (!policy || policy.createdBy !== adminId) {
      return {
        success: false,
        message: "Policy Not Found",
      };
    }

    await policy.update(policyData, { transaction: t });

    await LeavePolicyRule.destroy({
      where: { policyId: id },
      transaction: t,
    });

    for (const r of rules) {
      await LeavePolicyRule.create(
        {
          ...r,
          policyId: id,
        },
        { transaction: t },
      );
    }

    return {
      success: true,
      data: policy,
      message: "Policy Updated Successfully",
    };
  } catch (error) {
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
    const policies = await LeavePolicy.findAll();

    return {
      success: true,
      data: policies,
      message: "Policies Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
