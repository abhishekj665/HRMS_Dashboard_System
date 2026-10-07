import { API } from "../AuthService/authService";

export const registerUser = async (data) => {
  try {
    const response = await API.post("/admin/user/register", {
      data: data,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getUser = async (page, limit, search) => {
  try {
    const response = await API.get(
      `/admin/users?page=${page}&limit=${limit}&search=${search}`,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const blockUser = async (id) => {
  try {
    const response = await API.put(`/admin/block/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const unBlockUser = async (id) => {
  try {
    const response = await API.put(`/admin/unblock/${id}`);

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
