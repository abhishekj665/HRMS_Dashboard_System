import { LeaveType } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";

export const registerLeaveType = async (data) => {
  try {
    const leaveData = await LeaveType.create(data);

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Type Registered Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const updateLeaveType = async (id, data) => {
  try {
    const leaveData = await LeaveType.update(data, { where: { id } });

    if (leaveData) {
      return {
        success: true,
        data: leaveData,
        messsage: "Leave Type Updated Successfully",
      };
    }
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const deleteLeaveType = async (id) => {
  try {
    const leaveData = await LeaveType.destroy({ where: { id } });

    if (!leaveData) {
      return {
        success: false,
        messsage: "Leave Type Not Found",
      };
    }

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Type Deleted Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
