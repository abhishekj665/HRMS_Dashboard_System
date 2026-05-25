import { API } from "../AuthService/authService";

export const getCurrentSubscription = async () => {
  try {
    const response = await API.get("/subscription");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch subscription",
    };
  }
};
