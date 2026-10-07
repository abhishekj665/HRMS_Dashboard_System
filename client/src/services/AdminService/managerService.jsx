import { API } from "../AuthService/authService";

export const getManagers = async () => {
  try {
    const response = await API.get("/admin/manager");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
export const assignManager = async (payload) => {
  try {
    const response = await API.patch("/admin/manager/assign", payload);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getManagersWithUsers = async () => {
  try {
    const response = await API.get("/admin/manager/users");

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const registerNewManager = async (data) => {
  try {
    const response = await API.post("/admin/manager/register", {
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
