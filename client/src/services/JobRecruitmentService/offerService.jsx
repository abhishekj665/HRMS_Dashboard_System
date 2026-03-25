import { API, publicAPI } from "../AuthService/authService";

export const generateOffer = async (applicationId, offerData) => {
  try {
    const response = await API.post(
      `/recruitment/offer/generate/${applicationId}`,
      offerData,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to generate offer",
      status: error.response?.status || 500,
    };
  }
};

export const validateOfferToken = async (token) => {
  try {
    const response = await publicAPI.post(`/recruitment/offer/accept/${token}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to validate offer token",
      status: error.response?.status || 500,
    };
  }
};
