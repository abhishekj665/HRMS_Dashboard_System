import { API } from "../AuthService/authService";

export const getAllUserLeaveRequests = async (filters = {}) => {
  try {
    const response = await API.get("/manager/lms/leave/requests", {
      params: filters,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const approveLeaveRequest = async (id) => {
  try {
    const response = await API.patch(`/manager/lms/leave/approve/${id}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const rejectLeaveRequest = async (id, remark) => {
  try {
    const response = await API.patch(`/manager/lms/leave/reject/${id}`, {
      remark,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getLeaveBalance = async () => {
  try {
    const response = await API.get("/manager/lms/leave/leave-balance");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const registerLeaveRequest = async (data) => {
  try {
    const res = await API.post("/manager/lms/leave/apply", data);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getLeaveRequests = async (filters = {}) => {
  try {
    const response = await API.get("/manager/lms/leave/me", {
      params: filters,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
