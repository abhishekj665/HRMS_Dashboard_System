import { API } from "../AuthService/authService";
export const getInternalJobPosts = async (filter) => {
  try {
    const response = await API.get("/recruitment/internal/jobs", {
      params: filter,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const getInternalJobDetail = async (jobSlug, visibility) => {
  try {
    const response = await API.get(`/recruitment/internal/jobs/${jobSlug}`, {
      params: visibility ? { visibility } : undefined,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const applyInternalJob = async (jobSlug, data) => {
  try {
    const response = await API.post(`/recruitment/internal/jobs/apply/${jobSlug}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message,
    };
  }
};
export const submitReferral = async (jobSlug, data) => {
  try {
    const response = await API.post(`/recruitment/internal/jobs/referral/${jobSlug}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message,
    };
  }
};
export const getJobDetailByTenant = () => {};
