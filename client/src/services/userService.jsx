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
