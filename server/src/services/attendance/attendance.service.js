import STATUS from "../../constants/Status.js";
import { Attendance, User } from "../../models/Associations.model.js";
import {
  AttendancePolicy,
  OvertimePolicy,
} from "../../models/Associations.model.js";

import ExpressError from "../../utils/Error.utils.js";
import { Op } from "sequelize";

export const registerInService = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: {
        model: AttendancePolicy,
        include: OvertimePolicy,
      },
    });

    if (!user || !user.AttendancePolicy) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Policy not assigned");
    }

    const policy = user.AttendancePolicy;

    const now = new Date();

    const dayName = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .trim()
      .toUpperCase();

    const weekends = (policy.weekends || []).map((d) =>
      String(d).trim().toUpperCase(),
    );

    if (weekends.includes(dayName)) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Weekend not allowed");
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let row = await Attendance.findOne({
      where: {
        userId,
        punchInAt: { [Op.between]: [start, end] },
      },
    });

    if (row && row.lastInAt) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Already punched in");
    }

    const policyStart = new Date(now.toDateString() + " " + policy.startTime);

    const lateMin = Math.floor((now - policyStart) / (1000 * 60));

    const isLate = lateMin > (policy.graceLateMinute || 0);

    if (!row) {
      row = await Attendance.create({
        userId,
        punchInAt: now,
        lastInAt: now,
        workedMinutes: 0,
        isLate,
      });

      return {
        success: true,
        message: "Punch-in success",
        data: row.punchInAt,
      };
    }

    row.lastInAt = now;
    if (isLate) row.isLate = true;

    await row.save();

    return {
      success: true,
      message: "Punch-in Successfully",
      data: row.punchInAt,
    };
  } catch (e) {
    throw new ExpressError(STATUS.BAD_REQUEST, e.message);
  }
};

export const registerOutService = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: {
        model: AttendancePolicy,
        include: OvertimePolicy,
      },
    });

    if (!user || !user.AttendancePolicy) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Policy not assigned");
    }

    const policy = user.AttendancePolicy;
    const otPolicy = policy.OvertimePolicy;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const row = await Attendance.findOne({
      where: {
        userId,
        punchInAt: { [Op.between]: [start, end] },
      },
    });

    if (!row || !row.lastInAt) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No active punch-in");
    }

    const now = new Date();

    const sessionMinutes = Math.round((now - row.lastInAt) / (1000 * 60));

    row.workedMinutes = (row.workedMinutes || 0) + sessionMinutes;
    row.punchOutAt = now;
    row.lastInAt = null;

    const halfLimit = policy.graceHalfDayMinute || 240;

    if (row.workedMinutes < halfLimit) {
      row.isHalfDay = true;
    } else {
      row.isHalfDay = false;
    }

    const shiftEnd = new Date(now.toDateString() + " " + policy.endTime);

    if (otPolicy?.enable && now > shiftEnd) {
      const otMin = Math.round((now - shiftEnd) / (1000 * 60));

      if (otMin >= (otPolicy.overtimeMinutes || 0)) {
        row.overtimeMinutes = otMin;
      }
    }

    await row.save();

    return {
      success: true,
      message: "Punch-out success",
      data: {
        sessionMinutes,
        totalMinutes: row.workedMinutes,
        overtimeMinutes: row.overtimeMinutes || 0,
        isHalfDay: row.isHalfDay,
      },
    };
  } catch (e) {
    throw new ExpressError(STATUS.BAD_REQUEST, e.message);
  }
};

export const getTodayAttendanceService = async (userId) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const row = await Attendance.findOne({
      where: {
        userId,
        punchInAt: { [Op.between]: [start, end] },
      },
    });

    return {
      success: true,
      data: row,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
