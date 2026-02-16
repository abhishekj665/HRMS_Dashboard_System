import STATUS from "../../constants/Status.js";
import {
  Attendance,
  AttendanceLog,
  AttendanceRequest,
  User,
  AttendancePolicy,
  OvertimePolicy,
} from "../../models/Associations.model.js";

import ExpressError from "../../utils/Error.utils.js";
import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";
import { calculateWorkedSecondsFromLogs } from "../../utils/calaculateTime.utils.js";

const getActivePolicy = async (date, transaction) => {
  const d = date.toISOString().slice(0, 10);

  return AttendancePolicy.findOne({
    where: {
      effectiveFrom: { [Op.lte]: d },
      [Op.or]: [{ effectiveTo: null }, { effectiveTo: { [Op.gte]: d } }],
    },
    include: [{ model: OvertimePolicy }],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
};

export const registerInService = async (userId, { data }, ipAddress) => {
  const transaction = await sequelize.transaction();
  try {
    const now = new Date();
    const { lat, lng } = data;

    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new ExpressError(STATUS.BAD_REQUEST, "User not found");
    }

    if (!user.managerId && user.role === "user") {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You don't have an assigned manager so you can't punch in",
      );
    }

    const policy = await getActivePolicy(now, transaction);

    if (!policy) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "No active attendance policy for today",
      );
    }

    const dayName = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    const weekends = (policy.weekends || []).map((d) => d.toUpperCase());

    if (weekends.includes(dayName)) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Weekend not allowed");
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let row = await Attendance.findOne({
      where: { userId, punchInAt: { [Op.between]: [start, end] } },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (row) {
      const req = await AttendanceRequest.findOne({
        where: { attendanceId: row.id },
        attributes: ["status"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (req && req.status !== "PENDING") {
        throw new ExpressError(
          STATUS.BAD_REQUEST,
          "Attendance request already processed for today",
        );
      }
    }

    if (row) {
      const lastLog = await AttendanceLog.findOne({
        where: { attendanceId: row.id },
        order: [["punchTime", "DESC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (lastLog && lastLog.punchType === "IN") {
        throw new ExpressError(STATUS.BAD_REQUEST, "Already punched in");
      }
    }

    const policyStart = new Date(now.toDateString() + " " + policy.startTime);
    const lateMin = Math.floor((now - policyStart) / 60000);
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

      let requestedTo = null;

      if (user.role === "user") {
        requestedTo = user.managerId;
      } else if (user.role === "manager") {
        const admin = await User.findOne({
          where: { role: "admin" },
          attributes: ["id"],
          transaction,
        });
        requestedTo = admin?.id;
      }

      if (requestedTo) {
        await AttendanceRequest.create(
          {
            attendanceId: row.id,
            requestType: "REGULARIZATION",
            requestedBy: userId,
            requestedTo,
            status: "PENDING",
          },
          { transaction },
        );
      }
    } else {
      row.lastInAt = now;
      row.punchOutAt = null;
      if (isLate && !row.isLate) row.isLate = true;
      await row.save({ transaction });
    }

    await AttendanceLog.create(
      {
        userId,
        attendanceId: row.id,
        punchType: "IN",
        punchTime: now,
        source: "WEB",
        geoLatitude: lat,
        geoLongitude: lng,
        ipAddress,
      },
      { transaction },
    );

    await transaction.commit();

    return {
      success: true,
      message: "Punch-in success",
      data: { lastInAt: now },
    };
  } catch (e) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, e.message);
  }
};

export const registerOutService = async (userId, { data }, ipAddress) => {
  const transaction = await sequelize.transaction();
  try {
    const now = new Date();
    const { lat, lng } = data;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const row = await Attendance.findOne({
      where: { userId, punchInAt: { [Op.between]: [start, end] } },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!row) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No attendance for today");
    }

    const lastLog = await AttendanceLog.findOne({
      where: { attendanceId: row.id },
      order: [["punchTime", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!lastLog || lastLog.punchType !== "IN") {
      throw new ExpressError(STATUS.BAD_REQUEST, "No active punch-in");
    }

    await AttendanceLog.create(
      {
        userId,
        attendanceId: row.id,
        punchType: "OUT",
        punchTime: now,
        source: "WEB",
        geoLatitude: lat,
        geoLongitude: lng,
        ipAddress,
      },
      { transaction },
    );

    const totalSeconds = await calculateWorkedSecondsFromLogs(
      userId,
      row.id,
      transaction,
    );

    row.workedMinutes = Math.floor(totalSeconds / 60);
    row.punchOutAt = now;

    await row.save({ transaction });

    await transaction.commit();

    return {
      success: true,
      message: "Punch-out success",
      data: {
        totalSeconds,
        totalMinutes: row.workedMinutes,
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
      where: { userId, punchInAt: { [Op.between]: [start, end] } },
    });

    if (!row) {
      return { success: true, data: null };
    }

    const totalSeconds = await calculateWorkedSecondsFromLogs(
      userId,
      row.id,
      null,
    );

    return {
      success: true,
      data: {
        ...row.toJSON(),
        workedSeconds: totalSeconds,
      },
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
