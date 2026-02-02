import { API } from "../services/authService";

export const punchIn = async () => {
  try {
    const response = await API.post("/attendance/in", {
      withCredentials: true,
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

export const punchOut = async () => {
  try {
    const response = await API.put("/attendance/out", {
      withCredentials: true,
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