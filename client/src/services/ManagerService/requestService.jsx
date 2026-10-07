import { API } from "../AuthService/authService";

export const getRequestData = async () => {
  try {
    const response = await API.get("/manager/request");

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
    const response = await API.put(`/manager/request/approve/${id}`);
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
    let response = await API.put(`/manager/request/reject/${id}`, {
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
