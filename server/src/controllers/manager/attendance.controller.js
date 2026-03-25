import STATUS from "../../constants/Status.js";
import * as attendanceService from "../../services/manager/attendance.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const getAllAttendanceData = async (req, res, next) => {
  try {
    const response = await attendanceService.getAllAttendance(req.query, req.user);

    if (response.success) {
      return successResponse(
        res,
        response,
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


export const getAttendanceData = async (req, res, next) => {
  try {
    const response = await attendanceService.getAttendance(req.query, req.user);

    if (response.success) {
      return successResponse(
        res,
        response,
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



export const approveAttendanceRequest = async (req, res, next) => {
  try {
    const response = await attendanceService.approveAttendanceRequest(
      req.user,
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
      errorResponse(res, response.message, STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

export const rejectAttendanceRequest = async (req, res, next) => {
  try {
    
    const response = await attendanceService.rejectAttendanceRequest(
      req.user,
      req.params.id,
      req.body
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


export const bulkAttendanceRequestApprove = async (req, res, next) => {
  try{
    let response = await attendanceService.bulkAttendanceRequestApprove(req.body, req.user);

    if(response.success){
      return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    }else{
      return errorResponse(res, response.message, STATUS.BAD_REQUEST)
    }
  }catch(error){
    next(error);
  }
}

export const bulkAttendanceRequestReject = async (req, res, next) => {
  try{
    let response = await attendanceService.bulkAttendanceRequestReject(req.body, req.user);

    if(response.success){
      return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    }else{
      return errorResponse(res, response.message, STATUS.BAD_REQUEST)
    }
  }catch(error){
    next(error);
  }
}
