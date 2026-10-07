import { API } from "../AuthService/authService";

export const getAllAttendanceData = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await API.get(`/admin/attendance/all/?${params}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const approveAttendance = async (id) => {
  try {
    const response = await API.patch(`/admin/attendance/approve/${id}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};

export const rejectAttendance = async (id, remark) => {
  try {
    const response = await API.patch(`/admin/attendance/reject/${id}`, {
      remark,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};

export const bulkApproveAttendance = async (ids) => {
  try {
    let response = await API.patch(`/admin/attendance/bulk-approve`, {
      ids,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};

export const bulkRejectAttendance = async (ids, remark) => {
  try {
    

    const response = await API.patch(`/admin/attendance/bulk-reject`, {
      ids,
      remark,
    });

    

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};
