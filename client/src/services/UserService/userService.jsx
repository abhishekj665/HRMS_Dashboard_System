import { API } from "../AuthService/authService";

export const getProfile = async () => {
  try {
    const response = await API.get("/users/info/profile", {
      withCredentials: true,
    });
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

export const createAssetRequest = async (data) => {
  try {
    const payload = {
      assetId: data.assetId,
      quantity: 1,
      description: data.description,
      title: data.title,
    };

    const response = await API.post("/users/asset/request", payload);
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

export const getAssetRequest = async () => {
  try {
    const response = await API.get("/users/asset/request");
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
    const response = await API.get("/users/assets");

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

export const getAllAttendanceData = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await API.get(`/users/attendance/?${params}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getLeaveRequests = async () => {
  try {
    const response = await API.get(`/users/lms/leave/requests`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getLeaveBalance = async () => {
  try {
    const response = await API.get(`/users/lms/leave/leave-balance`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const registerLeaveRequest = async (data) => {
  try {
    
    const response = await API.post("/users/lms/leave/apply", data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
