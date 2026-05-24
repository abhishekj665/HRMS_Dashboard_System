import { API } from "../AuthService/authService";

export const createPaymentOrder = async (payload) => {
  try {
    const response = await API.post("/payment/order/create", payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to create payment order",
    };
  }
};
