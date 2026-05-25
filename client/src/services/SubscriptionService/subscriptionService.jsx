import { API } from "../AuthService/authService";

export const getSubscriptionPlans = async () => {
  try {
    const response = await API.get("/subscription/plans");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch plans",
    };
  }
};
