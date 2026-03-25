import { LeaveType } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { getScopedWhere, requireTenantId } from "../../utils/tenant.utils.js";

export const registerLeaveType = async (data, user) => {
  try {
    const leaveData = await LeaveType.create({
      ...data,
      tenantId: requireTenantId(user),
    });

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Type Registered Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const updateLeaveType = async (id, data, user) => {
  try {
    const leaveData = await LeaveType.update(data, {
      where: getScopedWhere(user, { id }),
    });

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

export const deleteLeaveType = async (id, user) => {
  try {
    const leaveData = await LeaveType.destroy({
      where: getScopedWhere(user, { id }),
    });

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

export const getLeaveTypes = async (user) => {
  try {
    
    const leaveData = await LeaveType.findAll({
      where: { tenantId: requireTenantId(user) },
    });

    if (!leaveData) {
      return {
        success: false,
        messsage: "No Leave Types Found",
      };
    }

    return {
      success: true,
      data: leaveData,
      messsage: "Leave Types Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
