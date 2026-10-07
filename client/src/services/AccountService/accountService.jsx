import { API } from "../AuthService/authService";

export const createAccount = async (data) => {
  try {
    const response = await API.post("/account", data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
