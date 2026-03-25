import { publicAPI } from "../AuthService/authService";

export const getAllJobs = async () => {
  try {
    const response = await publicAPI.get("/recruitment/jobs");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || response?.message,
    };
  }
};

export const getJobDetail = async (orgSlug, slug) => {
  try {
    const response = await publicAPI.get(`/recruitment/job/${orgSlug}/${slug}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || response?.message,
    };
  }
};
