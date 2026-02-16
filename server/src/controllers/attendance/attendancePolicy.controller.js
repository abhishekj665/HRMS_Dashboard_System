import STATUS from "../../constants/Status.js";
import * as attendancePolicyServices from "../../services/attendance/attendancePolicy.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const createAttendancePolicy = async (req, res, next) => {
  try {
    const response = await attendancePolicyServices.createAttendancePolicy(req.user.id,
      req.body,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.CREATED,
      );
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const getAttendancePolicies = async (req, res, next) => {
  try {
    const response = await attendancePolicyServices.getAttendancePolicies({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search || "",
    });

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};


export const getDefaultAttendancePolicy = async (req, res, next) => {
  try {
    const response = await attendancePolicyServices.getDefaultAttendancePolicy({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search || "",
    });

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

// export const getAttendancePolicyById = async (req, res, next) => {
//   try {
//     const response = await attendancePolicyServices.getAttendancePolicyById(
//       req.params.id,
//     );

//     if (response.success) {
//       return successResponse(
//         res,
//         response.data,
//         response.message,
//         STATUS.ACCEPTED,
//       );
//     } else {
//       return errorResponse(res, response.message);
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const updateAttendancePolicy = async (req, res, next) => {
  try {
    const response = await attendancePolicyServices.updateAttendancePolicy(
      req.params.id,
      req.body,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAttendancePolicy = async (req, res, next) => {
  try {
    const response = await attendancePolicyServices.deleteAttendancePolicy(
      req.params.id,
    );

    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        STATUS.ACCEPTED,
      );
    } else {
      return errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};
