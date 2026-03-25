import { AttendancePolicy, OvertimePolicy } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";
import { Op } from "sequelize";
import {
  getTenantOrGlobalWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const getAttendancePolicies = async ({ user }) => {
  try {
    const tenantId = requireTenantId(user);
    const policyData = await AttendancePolicy.findAll({
      where: getTenantOrGlobalWhere(tenantId, { deletedAt: null }),
      include: [OvertimePolicy],
      order: [
        ["tenantId", "DESC"],
        ["isDefault", "DESC"],
        ["effectiveFrom", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return {
      success: true,
      data: policyData,
      message: "Policies fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getDefaultAttendancePolicy = async ({ user }) => {
  const tenantId = requireTenantId(user);
  const policy = await AttendancePolicy.findOne({
    where: getTenantOrGlobalWhere(tenantId, {
      isDefault: true,
      deletedAt: null,
    }),
    include: [OvertimePolicy],
    order: [["tenantId", "DESC"]],
  });

  if (!policy) {
    return { success: false, message: "Default policy not found" };
  }

  return { success: true, data: policy };
};

export const createAttendancePolicy = async (user, { data }) => {
  const t = await sequelize.transaction();
  const tenantId = requireTenantId(user);

  try {
    const { attendancePolicy, overtimePolicy } = data;

    const shiftType = attendancePolicy.shiftType.toUpperCase();

    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const timeRegex = /^\d{2}:\d{2}$/;

    if (
      !timeRegex.test(attendancePolicy.startTime) ||
      !timeRegex.test(attendancePolicy.endTime)
    ) {
      throw new Error("Invalid time format HH:mm required");
    }

    const startMin = toMinutes(attendancePolicy.startTime);
    const endMin = toMinutes(attendancePolicy.endTime);

    if (shiftType === "SAMEDAY" && endMin <= startMin) {
      throw new Error("Invalid same-day shift time range");
    }

    if (shiftType === "OVERNIGHT" && endMin >= startMin) {
      throw new Error("Overnight shift must end next day");
    }

    if (startMin === endMin) {
      throw new Error("Same start and end time not allowed");
    }

    if (!attendancePolicy.effectiveFrom) {
      throw new Error("effectiveFrom required");
    }

    if (
      attendancePolicy.effectiveTo &&
      attendancePolicy.effectiveTo < attendancePolicy.effectiveFrom
    ) {
      throw new Error("Invalid effective date range");
    }

    const overlap = await AttendancePolicy.findOne({
      where: {
        tenantId,
        deletedAt: null,
        effectiveFrom: {
          [Op.lte]: attendancePolicy.effectiveTo || "9999-12-31",
        },
        effectiveTo: {
          [Op.gte]: attendancePolicy.effectiveFrom,
        },
      },
      transaction: t,
    });

    if (overlap) {
      throw new Error("Policy date range overlaps with existing policy");
    }

    if (attendancePolicy.isDefault) {
      const today = new Date().toISOString().slice(0, 10);
      if (attendancePolicy.effectiveFrom > today) {
        throw new Error("Default policy cannot start in future");
      }
    }

    if (attendancePolicy.isDefault === true) {
      await AttendancePolicy.update(
        { isDefault: false },
        { where: { tenantId, isDefault: true }, transaction: t },
      );
    }

    const attendance = await AttendancePolicy.create(
      {
        ...attendancePolicy,
        tenantId,
        shiftType,
        createdBy: user.id,
      },
      { transaction: t },
    );

    if (overtimePolicy?.enable) {
      if (overtimePolicy.overtimeMinutes < 0) {
        throw new Error("Overtime less than 0 not allowed");
      }

      await OvertimePolicy.create(
        {
          ...overtimePolicy,
          attendancePolicyId: attendance.id,
        },
        { transaction: t },
      );
    }

    await t.commit();

    const policyData = await AttendancePolicy.findByPk(attendance.id, {
      include: [OvertimePolicy],
    });

    return {
      success: true,
      data: policyData,
      message: "Attendance Policy Created",
    };
  } catch (error) {
    await t.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const updateAttendancePolicy = async (id, user, { data }) => {
  const t = await sequelize.transaction();
  const tenantId = requireTenantId(user);
  try {
    const { attendancePolicy, overtimePolicy } = data;

    const shiftType = attendancePolicy.shiftType.toUpperCase();

    const timeRegex = /^\d{2}:\d{2}$/;

    if (
      !timeRegex.test(attendancePolicy.startTime) ||
      !timeRegex.test(attendancePolicy.endTime)
    ) {
      throw new Error("Invalid time format HH:mm required");
    }

    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const startMin = toMinutes(attendancePolicy.startTime);
    const endMin = toMinutes(attendancePolicy.endTime);

    if (shiftType === "SAMEDAY" && endMin <= startMin) {
      throw new Error("Invalid same-day shift time range");
    }

    if (shiftType === "OVERNIGHT" && endMin >= startMin) {
      throw new Error("Overnight shift must end next day");
    }

    if (startMin === endMin) {
      throw new Error("Same start and end time not allowed");
    }

    if (!attendancePolicy.effectiveFrom) {
      throw new Error("effectiveFrom required");
    }

    if (
      attendancePolicy.effectiveTo &&
      attendancePolicy.effectiveTo < attendancePolicy.effectiveFrom
    ) {
      throw new Error("Invalid effective date range");
    }

    const overlap = await AttendancePolicy.findOne({
      where: {
        id: { [Op.ne]: id },
        tenantId,
        deletedAt: null,
        effectiveFrom: {
          [Op.lte]: attendancePolicy.effectiveTo || "9999-12-31",
        },
        effectiveTo: {
          [Op.gte]: attendancePolicy.effectiveFrom,
        },
      },
      transaction: t,
    });

    if (overlap) {
      throw new Error("Policy date range overlaps with existing policy");
    }

    if (attendancePolicy.isDefault === true) {
      await AttendancePolicy.update(
        { isDefault: false },
        {
          where: { tenantId, isDefault: true, deletedAt: null },
          transaction: t,
        },
      );
    }

    const [affectedRows] = await AttendancePolicy.update(
      {
        ...attendancePolicy,
        shiftType,
      },
      {
        where: { id, tenantId },
        transaction: t,
      },
    );

    if (!affectedRows) {
      await t.rollback();
      return { success: false, message: "Data Not Found" };
    }

    if (overtimePolicy) {
      if (overtimePolicy.overtimeMinutes < 0) {
        throw new Error("Overtime less than 0 not allowed");
      }

      const existingOTP = await OvertimePolicy.findOne({
        where: { attendancePolicyId: id },
        transaction: t,
      });

      if (existingOTP) {
        await existingOTP.update(overtimePolicy, { transaction: t });
      } else if (overtimePolicy.enable) {
        await OvertimePolicy.create(
          { ...overtimePolicy, attendancePolicyId: id },
          { transaction: t },
        );
      }
    }

    await t.commit();

    const updated = await AttendancePolicy.findByPk(id, {
      include: [OvertimePolicy],
    });

    return {
      success: true,
      data: updated,
      message: "Policy Updated",
    };
  } catch (error) {
    await t.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const deleteAttendancePolicy = async (id, user) => {
  try {
    const policy = await AttendancePolicy.findOne({
      where: { id, tenantId: requireTenantId(user) },
    });

    if (!policy) {
      return { success: false, message: "Policy Data Not Found" };
    }

    if (policy.isDefault) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Default policy cannot be deleted",
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    if (
      policy.effectiveFrom <= today &&
      (!policy.effectiveTo || policy.effectiveTo >= today)
    ) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Active policy cannot be deleted",
      );
    }

    await policy.destroy();

    return {
      success: true,
      message: "Attendance Policy Deleted Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

// export const getAttendancePolicyById = async (id) => {
//   try {
//     const policyData = await AttendancePolicy.findByPk(id, {
//       include: [OvertimePolicy],
//     });

//     if (!policyData) {
//       return { success: false, message: "Attendance Policy Data Not Found" };
//     }

//     return {
//       success: true,
//       data: policyData,
//       message: "Attendance Policy Data Fetched Successfully",
//     };
//   } catch (error) {
//     throw new ExpressError(STATUS.BAD_REQUEST, error.message);
//   }
// };

