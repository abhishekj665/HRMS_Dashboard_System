import STATUS from "../../constants/Status.js";
import { Attendance, User } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

export const getUserAttendance = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      include: [{ model: User, where: { role: "user" }, attributes : ["id", "role", "isVerified"]  }],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
    };
  } catch (error) {
    throw error;
  }
};

export const getManagerAttendance = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      include: [{ model: User, where: { role: "manager" } }],
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Attendance Data Found");
    }

    return {
      success: true,
      data: attendanceData,
    };
  } catch (error) {
    throw error;
  }
};

export const pendingUserAttendanceRequests = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { isApproved: "PENDING" },
      include: [{ model: User, where: { role: "user" }, attributes : ["id", "role", "isVerified"]  }],
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

export const pendingManagerAttendanceRequests = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { isApproved: "PENDING" },
      include: [{ model: User, where: { role: "manager" }, attributes : ["id", "role", "isVerified"]  }],
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

export const approvedUserAttendanceRequest = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { isApproved: "APPROVED" },
      include : [
        {model : User, where : {role : "user"}}
      ]
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

export const approvedManagerAttendanceRequest = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { isApproved: "APPROVED" },
      include : [
        {model : User, where : {role : "manager"}}
      ]
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

export const rejectedUserAttendanceRequest = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { isApproved: "REJECTED" },
      include: [{ model: User, where: { role: "user" } }],
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

export const rejectedManagerAttendanceRequest = async () => {
  try {
    const attendanceData = await Attendance.findAll({
      where: { isApproved: "REJECTED" },
      include: [{ model: User, where: { role: "manager" } }],
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

export const approveAttendanceRequest = async (managerId, id) => {
  try {
    const attendanceData = await Attendance.findOne({
      where: { id: id, isApproved: "PENDING" },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Data Not Found");
    }

    attendanceData.isApproved = "APPROVED";
    attendanceData.verifiedBy = managerId;

    await attendanceData.save();

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Approved Succussfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectAttendanceRequest = async (managerId, id) => {
  try {
    const attendanceData = await Attendance.findOne({
      where: { id: id, isApproved: "PENDING" },
    });

    if (!attendanceData) {
      throw new ExpressError(STATUS.BAD_REQUEST, "No Data Found");
    }

    ((attendanceData.isApproved = "REJECTED"),
      (attendanceData.verifiedBy = managerId));

    await attendanceData.save();

    return {
      success: true,
      data: attendanceData,
      message: "Attendance Rejected Successfully ",
    };
  } catch (error) {
    n;
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
