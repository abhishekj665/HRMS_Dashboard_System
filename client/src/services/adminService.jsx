import { API } from "../redux/auth/authService";

export const getUser = async () => {
  try {
    const response = await API.get("/users");
    return {
      success: true,
      data: response.data,
    };
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

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const blockIP = async (ip) => {
  try {
    console.log(ip);
    const response = await API.put(`/admin/block`, { ip: ip });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const unBlockIP = async (ip) => {
  try {
    const response = await API.put(`/admin/unblock`, { ip: ip });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getRequestData = async () => {
  try {
    let response = await API.get("/admin/request");

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const approveRequest = async (id) => {
  try {
    let response = await API.put(`/admin/request/approve/${id}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const rejectRequest = async (id) => {
  try {
    let response = await API.put(`/admin/request/reject/${id}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
