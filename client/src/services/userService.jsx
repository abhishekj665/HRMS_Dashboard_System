import { API } from "../redux/auth/authService";

export const getProfile = async () => {
  try {
    const response = await API.get("/users/profile", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAssetRequest = async (data) => {
  try {
    let response = await API.post("/users/asset", data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAssetRequest = async () => {
  try {
    let response = await API.get("/users/asset");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
