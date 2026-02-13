import STATUS from "../../constants/Status.js";
import {
  Attendance,
  AttendanceLog,
  AttendanceRequest,
  User,
} from "../../models/Associations.model.js";
import {
  AttendancePolicy,
  OvertimePolicy,
} from "../../models/Associations.model.js";

import ExpressError from "../../utils/Error.utils.js";
import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";

export const registerInService = async (userId, { data }, ipAddress) => {
  const transaction = await sequelize.transaction();

  const latitute = data.lat;
  const longitude = data.lng;

  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: AttendancePolicy,
          include: [{ model: OvertimePolicy }],
        },
      ],
      transaction,
    });

    if (!user || !user.AttendancePolicy) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Policy not assigned");
    }

    if (!user.managerId && user.role === "user") {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You don't have an assigned manager so you can't punch in",
      );
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
      transaction,
    });

    if (row) {
      let requestData = await AttendanceRequest.findOne({
        where: { attendanceId: row.id },
        attributes: ["status"],
      });

      if (requestData.status != "PENDING") {
        throw new ExpressError(STATUS.BAD_REQUEST, "You can't punch in now");
      }
      throw new ExpressError(STATUS.BAD_REQUEST, "Already punched in");
    }

    const policyStart = new Date(now.toDateString() + " " + policy.startTime);

    const lateMin = Math.floor((now - policyStart) / (1000 * 60));

    const isLate = lateMin > (policy.graceLateMinute || 0);

    if (!row) {
      row = await Attendance.create(
        {
          userId,
          punchInAt: now,
          lastInAt: now,
          workedMinutes: 0,
          isLate,
        },
        { transaction },
      );

      await AttendanceLog.create(
        {
          userId,
          attendanceId: row.id,
          punchType: "IN",
          punchTimeUTC: now,
          source: "WEB",
          geoLongitude: longitude,
          geoLatitude: latitute,
          ipAddress: ipAddress,
        },
        { transaction },
      );

      if (user.role == "user") {
        await AttendanceRequest.create(
          {
            attendanceId: row.id,
            requestType: "REGULARIZATION",
            requestedBy: userId,
            requestedTo: user.managerId,
            status: "PENDING",
          },
          { transaction },
        );
      } else if (user.role == "manager") {
        const admin = await User.findOne({
          where: { role: "admin" },
          attributes: ["id"],
        });
        await AttendanceRequest.create(
          {
            attendanceId: row.id,
            requestType: "REGULARIZATION",
            requestedBy: userId,
            requestedTo: admin.id,
            status: "PENDING",
          },
          { transaction },
        );
      }

      await transaction.commit();

      return {
        success: true,
        message: "Punch-in success",
        data: row.punchInAt,
      };
    }

    row.lastInAt = now;
    if (isLate) row.isLate = true;

    await row.save({ transaction });

    await AttendanceLog.create(
      {
        userId,
        attendanceId: row?.id || null,
        punchType: "IN",
        punchTimeUTC: now,
        source: "WEB",

        geoLongitude: longitude,
        geoLatitude: latitute,
        ipAddress: ipAddress,
      },
      { transaction },
    );

    await transaction.commit();

    return {
      success: true,
      message: "Punch-in Successfully",
      data: row.punchInAt,
    };
  } catch (e) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, e.message);
  }
};

export const registerOutService = async (userId, { data }, ipAddress) => {
  const transaction = await sequelize.transaction();
  const latitute = data.lat;
  const longitude = data.lng;
  try {
    const user = await User.findByPk(
      userId,

      {
        include: [
          {
            model: AttendancePolicy,
            include: [{ model: OvertimePolicy }],
          },
        ],
        transaction,
      },
    );

    if (!user || !user.AttendancePolicy) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Policy not assigned");
    }

    if (!user.managerId && user.role === "user") {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You don't have an assigned manager so you can't punch out",
      );
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
      transaction,
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

    await row.save({ transaction });

    await AttendanceLog.create(
      {
        userId,
        attendanceId: row.id,
        punchType: "OUT",
        punchTimeUTC: now,
        source: "WEB",
        geoLatitude: latitute,
        geoLongitude: longitude,
        ipAddress: ipAddress,
      },
      { transaction },
    );

    await transaction.commit();

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
    await transaction.rollback();
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
