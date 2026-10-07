import { API } from "../AuthService/authService";

export const getAllAssets = async () => {
  try {
    const  response = await API.get(`/admin/asset`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const createAsset = async (data) => {
  try {
    const response = await API.post(`/admin/asset`, data);

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const deleteAsset = async (id) => {
  try {
    const response = await API.delete(`/admin/asset/${id}`);

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const updateAsset = async (id, data) => {
  try {
    const response = await API.put(`/admin/asset/${id}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
