import { API } from "../AuthService/authService";

export const registerJobApplication = async (slug, data) => {
  try {
    const response = await API.post(
      `/recuirment/application/apply/${slug}`,
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
    const response = await API.get("/recuirment/application/all", {
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
    const response = await API.get(`/recuirment/application/${id}`);

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
    const response = await API.patch(`/recuirment/application/shortlist/${id}`);

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
    const response = await API.patch(`/recuirment/application/reject/${id}`);

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
