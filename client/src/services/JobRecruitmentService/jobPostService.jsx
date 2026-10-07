import { API } from "../AuthService/authService";

export const getAllJobPosts = async () => {
  try {
    const response = await API.get("/recruitment/job-posts");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch job posts",
    };
  }
};

export const getJobPost = async (id) => {
  try {
    const response = await API.get(`/recruitment/job-post/${id}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch job post",
    };
  }
};

export const updateJobPost = async (id, data) => {
  try {
    const response = await API.patch(`/recruitment/job-post/${id}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update job post",
    };
  }
};
