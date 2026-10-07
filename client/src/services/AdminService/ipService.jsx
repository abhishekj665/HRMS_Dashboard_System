import { API } from "../AuthService/authService";

export const blockIP = async (ip) => {
  try {
    const response = await API.put(`/admin/block`, { ip: ip });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const unBlockIP = async (ip) => {
  try {
    const response = await API.put(`/admin/unblock`, { ip: ip });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getAllIps = async (page, limit) => {
  try {
    const response = await API.get(`/admin/ips/?page=${page}&limit=${limit}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
