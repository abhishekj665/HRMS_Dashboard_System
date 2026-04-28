import { API } from "../AuthService/authService";

export const getDepartments = async () => {
  try {
    const response = await API.get("/department/");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const createDepartment = async (payload) => {
  try {
    const response = await API.post("/department", payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
