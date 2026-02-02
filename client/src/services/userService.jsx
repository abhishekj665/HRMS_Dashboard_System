import { API } from "../services/authService";

export const getProfile = async () => {
  try {
    const response = await API.get("/users/profile", {
      withCredentials: true,
    });
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

export const createAssetRequest = async (data) => {
  try {
    const payload = {
      assetId: data.assetId,
      quantity: 1,
      description: data.description,
      title: data.title,
    };

    let response = await API.post("/users/asset/request", payload);
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

export const getAssetRequest = async () => {
  try {
    let response = await API.get("/users/asset/request");
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

export const getAssetInfo = async () => {
  try {
    let response = await API.get("/users/assets");

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
