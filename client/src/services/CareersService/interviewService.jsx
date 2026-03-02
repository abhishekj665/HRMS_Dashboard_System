import { API } from "../AuthService/authService";

export const getInterviewers = async () => {
  try {
    const response = await API.get("/recuirment/interview/interviewers");

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

export const assignInterview = async (data) => {
  try {
    const response = await API.post("/recuirment/interview/assign", data);

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

export const getManagerInterviews = async (query) => {
  try {
    const response = await API.get("/recuirment/interview/all", {
      params: query,
    });

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

export const confirmInterview = async (id) => {
  try {
    const response = await API.patch(`/recuirment/interview/confirm/${id}`);
    console.log(response);
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

export const declineInterview = async (id) => {};

export const requestReschedule = async (id) => {};
