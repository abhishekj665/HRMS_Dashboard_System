import { API } from "../AuthService/authService";

export const getRequestData = async () => {
  try {
    const response = await API.get("/admin/request");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const approveRequest = async (id) => {
  try {
    const response = await API.put(`/admin/request/approve/${id}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.response?.data || error.message,
    };
  }
};

export const rejectRequest = async (id, remark) => {
  try {
    const response = await API.put(`/admin/request/reject/${id}`, {
      remark: remark,
    });

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.response?.data || error.message,
    };
  }
};
