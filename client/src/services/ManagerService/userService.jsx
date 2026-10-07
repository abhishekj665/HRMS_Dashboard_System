import { API } from "../AuthService/authService";

export const registerUser = async (data) => {
  try {
    const response = await API.post("/manager/user/register", {
      data: data,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getUser = async (page, limit) => {
  try {
    const response = await API.get(
      `/manager/users?page=${page}&limit=${limit}`,
    );
    return {
      success: true,
      data: response?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
