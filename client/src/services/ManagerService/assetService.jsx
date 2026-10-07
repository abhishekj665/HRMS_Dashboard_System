import { API } from "../AuthService/authService";

export const getAllAssets = async () => {
  try {
    const response = await API.get(`/manager/asset`);

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
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

    const response = await API.post("/manager/asset/request", payload);
    return response?.data;
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
    const response = await API.get("/manager/assets");

    return response?.data;
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
