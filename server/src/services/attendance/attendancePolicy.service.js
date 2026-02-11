import { AttendancePolicy } from "../../models/Associations.model.js";
import OvertimePolicy from "../../models/OvertimePolicy.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";

export const createAttendancePolicy = async (userId, data) => {
  const t = await sequelize.transaction();
  try {
    const { overtimePolicy, ...attendancePolicy } = data;

    const existing = await AttendancePolicy.count();

    if (existing > 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Attendance policy already exists. Update instead of creating.",
      );
    }

    const shiftType = attendancePolicy.shiftType.toUpperCase();
    const endTime = attendancePolicy.endTime;
    const startTime = attendancePolicy.startTime;

    if (shiftType === "SAMEDAY" && endTime <= startTime) {
      throw new Error("Invalid same-day shift time range");
    }

    if (shiftType === "OVERNIGHT" && endTime >= startTime) {
      throw new Error("Overnight shift must end next day");
    }

    if (attendancePolicy.startTime == attendancePolicy.endTime) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Same Start and End time not allwoed",
      );
    }

    const attendance = await AttendancePolicy.create(
      {
        ...attendancePolicy,
        shiftType: shiftType,
        createdBy: userId,
      },
      {
        transaction: t,
      },
    );

    if (overtimePolicy.overtimeMinutes < 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Overtime Less than 0 not allowed",
      );
    }

    if (overtimePolicy.enable) {
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
      message: "Attendance and Overtime Policy Created",
    };
  } catch (error) {
    await t.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getAttendancePolicies = async () => {
  try {
    const policyData = await AttendancePolicy.findOne({
      where: { isDefault: true },
      include: [OvertimePolicy],
    });

    if (!policyData.length) {
      return { success: false, message: "Attendance Policy Data Not Found" };
    }

    return {
      success: true,
      data: policyData,
      message: "Data Found Successfully",
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

export const updateAttendancePolicy = async (id, data) => {
  const t = await sequelize.transaction();
  try {
    const { overtimePolicy, ...attendanceData } = data;

    const shiftType = attendanceData.shiftType.toUpperCase();
    const endTime = attendanceData.endTime;
    const startTime = attendanceData.startTime;

    if (shiftType === "SAMEDAY" && endTime <= startTime) {
      throw new Error("Invalid same-day shift time range");
    }

    if (shiftType === "OVERNIGHT" && endTime >= startTime) {
      throw new Error("Overnight shift must end next day");
    }

    if (attendancePolicy.startTime == attendanceData.endTime) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Same Start and End time not allwoed",
      );
    }

    const [affectedRows] = await AttendancePolicy.update(attendanceData, {
      where: { id },
      transaction: t,
    });

    if (!affectedRows) {
      await t.rollback();
      return { success: false, message: "Data Not Found" };
    }

    if (overtimePolicy) {
      const existingOTP = await OvertimePolicy.findOne({
        where: { attendancePolicyId: id },
        transaction: t,
      });

      if (existingOTP) {
        await existingOTP.update(overtimePolicy, { transaction: t });
      } else {
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

export const deleteAttendancePolicy = async (id) => {
  try {
    const policy = await AttendancePolicy.findByPk(id);

    if (!policy) {
      return { success: false, message: "Policy Data Not Found" };
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
