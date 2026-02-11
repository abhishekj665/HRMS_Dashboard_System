import STATUS from "../../constants/Status.js";
import { Attendance } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

export const getAttendance = async (userId) => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { userId: userId },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Data Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const pendingAttendanceRequests = async (userId) => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { userId: userId, isApproved: "PENDING" },
    });

    if (!attendanceData) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "No pending attendance record found",
      );
    }

    return {
      success: true,
      data: attendanceData,
      message: "Data Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const approvedAttendanceRequest = async (userId) => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { userId: userId, isApproved: "APPROVED" },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Data Found",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectedAttendanceRequest = async (userId) => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { userId: userId, isApproved: "REJECTED" },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Data Found",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
