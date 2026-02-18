import {
  LeaveBalance,
  User,
  LeavePolicyRule,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

export const assignLeaveBalances = async (userId, year) => {
  try {
    const user = await User.findByPk(userId);

    if (!user.leavePolicyId) throw new Error("User has no policy");

    const rules = await LeavePolicyRule.findAll({
      where: { policyId: user.leavePolicyId },
    });

    for (const rule of rules) {
      await LeaveBalance.findOrCreate({
        where: {
          userId,
          leaveTypeId: rule.leaveTypeId,
          year,
        },
        defaults: {
          policyId: user.leavePolicyId,
          totalAllocated: rule.quotaPerYear,
          used: 0,
          balance: rule.quotaPerYear,
        },
      });
    }

    return {
      success: true,
      message: "Leave balances assigned successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
