import { API, publicAPI } from "../AuthService/authService";

export const registerJobApplication = async (orgSlug, slug, data) => {
  try {
    const response = await publicAPI.post(
      `/recruitment/application/apply/${orgSlug}/${slug}`,
      data,
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

export const getApplications = async (query) => {
  try {
    const response = await API.get("/recruitment/application/all", {
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

export const getApplicationById = async (id) => {
  try {
    const response = await API.get(`/recruitment/application/${id}`);

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

export const shortlistApplication = async (id) => {
  try {
    const response = await API.patch(
      `/recruitment/application/shortlist/${id}`,
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

export const rejectApplication = async (id) => {
  try {
    const response = await API.patch(`/recruitment/application/reject/${id}`);

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
