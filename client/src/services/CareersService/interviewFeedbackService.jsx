import { API } from "../AuthService/authService";

export const submitInterviewFeedback = async (interviewId, feedbackData) => {
  try {
    const response = await API.post(
      `/recruitment/interview-feedback/${interviewId}`,
      feedbackData,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};

export const getInterviewFeedback = async (interviewId) => {
  try {
    const response = await API.get(
      `/recruitment/interview-feedback/${interviewId}`,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        response.data?.message || error.message || "Something went wrong",
      status: response.status || 500,
    };
  }
};
