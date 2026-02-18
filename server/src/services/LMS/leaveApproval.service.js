import STATUS from "../../constants/Status.js";
import ExpressError from "../../utils/Error.utils.js";
import {
  LeaveAuditLog,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  User,
} from "../../models/Associations.model.js";

export const approveLeaveRequest = async (id, data) => {
  try {
    const leaveData = await LeaveRequest.findOne({
      where: { id },
      include: [
        { model: LeaveType, required: true },

        { model: LeaveAuditLog, as: "auditLogs", required: false },

        {
          model: User,
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
      ],
    });

    console.log(leaveData);
    console.log(leaveData.User);
    console.log(leaveData.User.leaveBalances);
    console.log(leaveData.LeaveType)
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
