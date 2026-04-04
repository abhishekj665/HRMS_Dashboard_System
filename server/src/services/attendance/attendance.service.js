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
import {
  getAttendanceReceiver,
  buildPunchInMailData,
  attendanceMailTemplate,
} from "../../utils/attendanceMail.utils.js";
import { sendMail } from "../../config/otpService.js";
import { getToday } from "../../utils/localTime.utils.js";
import {
  getTenantOrGlobalWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

const getActivePolicy = async (tenantId, date, transaction) => {
  const d = date.toISOString().slice(0, 10);

  return AttendancePolicy.findOne({
    where: {
      tenantId,
      effectiveFrom: { [Op.lte]: d },
      [Op.or]: [{ effectiveTo: null }, { effectiveTo: { [Op.gte]: d } }],
    },
    include: [{ model: OvertimePolicy }],
    order: [["tenantId", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
};

const closePreviousOpenAttendance = async (authUser, transaction) => {
  const oldAttendance = await Attendance.findOne({
    where: {
      userId: authUser.id,
      tenantId: authUser.tenantId,
      punchOutAt: null,
      date: {
        [Op.lt]: getToday,
      },
    },
    order: [["date", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!oldAttendance) {
    return;
  }

  const lastLog = await AttendanceLog.findOne({
    where: { attendanceId: oldAttendance.id, tenantId: authUser.tenantId },
    order: [["punchTime", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!lastLog || lastLog.punchType !== "IN") {
    return;
  }

  const autoPunchOutTime = new Date(`${oldAttendance.date}T23:59:59`);

  await AttendanceLog.create(
    {
      tenantId: authUser.tenantId,
      userId: authUser.id,
      attendanceId: oldAttendance.id,
      punchType: "OUT",
      punchTime: autoPunchOutTime,
      source: "SYSTEM",
      ipAddress: "AUTO_PUNCH_OUT",
    },
    { transaction },
  );

  const totalSeconds = await calculateWorkedSecondsFromLogs(
    authUser.id,
    oldAttendance.id,
    transaction,
  );

  const workedMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(workedMinutes / 60);

  oldAttendance.workedMinutes = workedMinutes;
  oldAttendance.punchOutAt = autoPunchOutTime;
  oldAttendance.isHalfDay = totalHours >= 4 && totalHours < 8;
  oldAttendance.isFullDay = totalHours >= 8;

  await oldAttendance.save({ transaction });
};

export const registerInService = async (authUser, { data }, ipAddress) => {
  const transaction = await sequelize.transaction();
  let committed = false;
  let mailPayload = null;
  try {
    const now = new Date();
    const { lat, lng } = data;
    const tenantId = requireTenantId(authUser);

    const user = await User.findOne({
      where: { id: authUser.id, tenantId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new ExpressError(STATUS.BAD_REQUEST, "User not found");
    }

    if (!user.managerId && user.role === "employee") {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You don't have an assigned manager so you can't punch in",
      );
    }

    const policy = await getActivePolicy(tenantId, now, transaction);

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

    await closePreviousOpenAttendance(authUser, transaction);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let row = await Attendance.findOne({
      where: {
        userId: authUser.id,
        tenantId,
        punchInAt: { [Op.between]: [start, end] },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (row) {
      const req = await AttendanceRequest.findOne({
        where: { attendanceId: row.id, tenantId },
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
        where: { attendanceId: row.id, tenantId },
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

    let isFirstPunch = false;
    let mailMeta = null;

    if (!row) {
      row = await Attendance.create(
        {
          tenantId,
          userId: authUser.id,
          punchInAt: now,
          date: getToday,
          lastInAt: now,
          workedMinutes: 0,
          isLate,
        },
        { transaction },
      );

      const requestedTo = await getAttendanceReceiver(user, transaction);

      if (requestedTo) {
        await AttendanceRequest.create(
          {
            attendanceId: row.id,
            tenantId,
            requestType: "REGULARIZATION",
            requestedBy: authUser.id,
            requestedTo,
            status: "PENDING",
          },
          { transaction },
        );

        mailMeta = { requestedTo };
        isFirstPunch = true;
      }
    } else {
      row.lastInAt = now;
      row.punchOutAt = null;
      if (isLate && !row.isLate) row.isLate = true;
      await row.save({ transaction });
    }

    await AttendanceLog.create(
      {
        tenantId,
        userId: authUser.id,
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
    committed = true;

    if (isFirstPunch && mailMeta?.requestedTo) {
      mailPayload = {
        requestedTo: mailMeta.requestedTo,
        user,
        now,
        lat,
        lng,
      };
    }

    if (mailPayload) {
      try {
        const receiver = await User.findByPk(mailPayload.requestedTo, {
          attributes: ["email", "first_name"],
        });

        if (receiver) {
          const mailData = buildPunchInMailData(
            mailPayload.user,
            mailPayload.now,
            ipAddress,
            mailPayload.lat,
            mailPayload.lng,
          );

          mailData.receiverName = receiver.first_name;

          const html = attendanceMailTemplate(mailData);

          await sendMail(receiver.email, "Attendance Punch-In Alert", html);
          console.log("mail sent to", receiver.email);
        } else {
          console.log("receiver not found");
        }
      } catch (mailErr) {
        console.error("Mail failed:", mailErr);
      }
    }

    return {
      success: true,
      message: "Punch-in success",
      data: { lastInAt: now },
    };
  } catch (e) {
    if (!committed) {
      await transaction.rollback();
      throw new ExpressError(STATUS.BAD_REQUEST, e.message);
    }
  }
};

export const registerOutService = async (authUser, { data }, ipAddress) => {
  const transaction = await sequelize.transaction();
  try {
    const now = new Date();
    const { lat, lng } = data;
    const tenantId = requireTenantId(authUser);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const row = await Attendance.findOne({
      where: {
        userId: authUser.id,
        tenantId,
        punchInAt: { [Op.between]: [start, end] },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!row) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No attendance for today");
    }

    const lastLog = await AttendanceLog.findOne({
      where: { attendanceId: row.id, tenantId },
      order: [["punchTime", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!lastLog || lastLog.punchType !== "IN") {
      throw new ExpressError(STATUS.BAD_REQUEST, "No active punch-in");
    }

    await AttendanceLog.create(
      {
        tenantId,
        userId: authUser.id,
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
      authUser.id,
      row.id,
      transaction,
    );
    const workedMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(workedMinutes / 60);

    let isHalfDay = false;
    let isFullDay = false;

    if (totalHours >= 4 && totalHours < 8) {
      isHalfDay = true;
      isFullDay = false;
    } else if (totalHours >= 8) {
      isFullDay = true;
      isHalfDay = false;
    }

    row.workedMinutes = workedMinutes;
    row.isFullDay = isFullDay;
    row.isHalfDay = isHalfDay;
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

export const getTodayAttendanceService = async (user) => {
  try {
    const tenantId = requireTenantId(user);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const row = await Attendance.findOne({
      where: {
        userId: user.id,
        tenantId,
        punchInAt: { [Op.between]: [start, end] },
      },
    });

    if (!row) {
      return { success: true, data: null };
    }

    const totalSeconds = await calculateWorkedSecondsFromLogs(
      user.id,
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

export const getAttendanceSummary = async (user, month, year) => {
  try {
    const tenantId = requireTenantId(user);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!monthNum || !yearNum) {
      throw new Error("Invalid month or year");
    }

    const monthStr = String(monthNum).padStart(2, "0");
    const startDate = `${yearNum}-${monthStr}-01`;
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${yearNum}-${monthStr}-${lastDay}`;

    const attendanceData = await Attendance.findAll({
      where: {
        userId: user.id,
        tenantId,
        status: "APPROVED",
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["isLate", "isHalfDay", "workedMinutes", "date"],
    });

    let totalPresent = 0;
    let totalHalfDay = 0;
    let totalLeave = 0;
    let totalLate = 0;

    attendanceData.forEach((item) => {
      if (item.isHalfDay) {
        totalHalfDay++;
      } else if (item.isFullDay) {
        totalPresent++;
      }
      if (item.isLate) {
        totalLate++;
      } else {
        totalLeave++;
      }
    });

    return {
      success: true,
      data: {
        totalDays: attendanceData.length,
        totalPresent,
        totalHalfDay,
        totalLate,
        totalLeave,
      },
    };
  } catch (error) {
    throw error;
  }
};
