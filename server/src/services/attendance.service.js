import { Attendance } from "../models/Associations.model.js";
import ExpressError from "../utils/Error.utils.js";
import { Op } from "sequelize";

export const registerInService = async (userId) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      where: {
        userId,
        punchInAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      order: [["punchInAt", "DESC"]],
    });

    if (existingAttendance) {
      return {
        success: true,
        message: "You Already Punched",
        data: existingAttendance.punchInAt,
      };
    }

    const data = await Attendance.create({
      userId,
      punchInAt: new Date(),
    });

    return {
      success: true,
      data : data.punchInAt,
      message: "PunchIn successfully",
    };
  } catch (error) {
    throw new ExpressError(400, error.message);
  }
};

export const registerOutService = async (userId) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const data = await Attendance.findOne({
      where: {
        userId: userId,
        punchInAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      order: [["punchInAt", "DESC"]],
    });

  

    if (data) {
      data.punchOutAt = Date.now();
      await data.save();
    }

    let time = new Date(data.punchOutAt) - new Date(data.punchInAt);

    const workingHour = time / (1000 * 60 * 60);

    if (workingHour < 8) {
      data.punchOutAt = Date.now();
      data.totalLeaves += 1 / 2;
      data.presentDay += 1 / 2;
      await data.save();

      return {
        success: true,
        message: "Punched Out, Half Day Marked",
      };
    }

    if (workingHour >= 8) {
      data.punchOutAt = Date.now();
      data.totalLeaves += 1 / 2;
      data.presentDay += 1 / 2;
      await data.save();

      return {
        success: true,
        message: "You Successfully Punch Out, FullDay Marked",
      };
    }

    return {
      success: true,
      data: data,
      message: "You Successfully PunchOut",
    };
  } catch (error) {
    throw new ExpressError(400, error.message);
  }
};
