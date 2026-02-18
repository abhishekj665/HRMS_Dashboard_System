import { LeaveRequest, LeaveType } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";

export const registerLeaveRequest = async (data, userId) => {
  try {
    const leaveData = await LeaveRequest.create({
      ...data,
      userId: userId,
      status: "pending",
    });

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Registered Successfully",
    };
  } catch (error) {
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
