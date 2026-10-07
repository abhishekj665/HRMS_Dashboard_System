import { API } from "../AuthService/authService";

export const getInterviewers = async () => {
  try {
    const response = await API.get("/recruitment/interview/interviewers");

    return response?.data;
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

export const assignInterview = async (data) => {
  try {
    const response = await API.post("/recruitment/interview/assign", data);

    return response?.data;
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

export const getManagerInterviews = async (query) => {
  try {
    const response = await API.get("/recruitment/interview/all", {
      params: query,
    });

    return response?.data;
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

export const confirmInterview = async (id) => {
  try {
    const response = await API.patch(`/recruitment/interview/confirm/${id}`);
    return response?.data;
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

export const declineInterview = async (id, remark) => {
  try {
    const response = await API.patch(
      `/recruitment/interview/decline/${id}`,
      remark,
    );
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};

export const requestReschedule = async (id, data) => {
  try {
    const response = await API.patch(`/recruitment/interview/reschedule/${id}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};

export const getActiveInterview = async (id) => {
  try {
    const response = await API.get(`/recruitment/interview/active/${id}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};
