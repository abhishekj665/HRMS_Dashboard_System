import { API } from "../AuthService/authService";

export const getAllManagerLeaveRequests = async (filters = {}) => {
  try {
    const response = await API.get(`/admin/leave/requests`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const approveLeaveRequest = async (id) => {
  try {
    const response = await API.patch(`/admin/leave/approve/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const rejectLeaveRequest = async (id, remark) => {
  try {
    const response = await API.patch(`/admin/leave/reject/${id}`, {
      remark,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};






