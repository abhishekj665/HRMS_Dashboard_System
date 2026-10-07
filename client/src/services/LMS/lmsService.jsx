import { API } from "../AuthService/authService";

export const getLeaveTypes = async () => {
  try {
    const response = await API.get("/lms/leave/leave-type");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getLeavePolicies = async () => {
  try {
    const response = await API.get("/lms/policy/all");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const createLeavePolicy = async (data) => {
  try {
    const response = await API.post("lms/policy/register", data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const updateLeavePolicy = async (id, data) => {
  try {
    const response = await API.put(`lms/policy/update/${id}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const registerLeaveType = async (data) => {
  try {
    const response = await API.post("/lms/leave/leave-type", data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
