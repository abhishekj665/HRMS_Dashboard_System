import { API } from "../AuthService/authService";

export const getMyProfile = async () => {
  try {
    const response = await API.get("/users/profile", { withCredentials: true });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch profile",
    };
  }
};

export const updateMyProfile = async (data) => {
  try {
    const response = await API.put("/users/profile", data, { withCredentials: true });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to update profile",
    };
  }
};

export const uploadProfileDocuments = async (formData) => {
  try {
    const response = await API.put("/users/profile/documents", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to upload documents",
    };
  }
};
