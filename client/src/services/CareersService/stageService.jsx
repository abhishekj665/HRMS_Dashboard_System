import { API } from "../AuthService/authService";

export const moveToNextStage = async (applicationId) => {
  try {
    const response = await API.patch(`/recruitment/stage/next/${applicationId}`);
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
