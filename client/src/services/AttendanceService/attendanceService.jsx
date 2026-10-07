import { API } from "../AuthService/authService";

export const punchIn = async (data) => {
  try {
    const response = await API.post(
      "/attendance/in",
      {
        withCredentials: true,
        data,
      },
      {
        skipGlobalLoading: true,
      },
    );

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

export const punchOut = async (data) => {
  try {
    const response = await API.put(
      "/attendance/out",
      {
        withCredentials: true,
        data,
      },
      {
        skipGlobalLoading: true,
      },
    );
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

export const getTodayAttendance = async () => {
  try {
    const response = await API.get("/attendance/today", {
      skipGlobalLoading: true,
    });
    return response.data;
  } catch (e) {
    return {
      success: false,
      message: e.response?.data?.message || "Status fetch failed",
    };
  }
};

export const getAttendanceByDate = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await API.get(`/attendance/by-date?${params}`, {
      skipGlobalLoading: true,
    });
    return response.data;
  } catch (e) {
    return {
      success: false,
      message: e.response?.data?.message || "Attendance fetch failed",
    };
  }
};

export const registerAttendancePolicy = async (data) => {
  try {
    const response = await API.post("/attendance-policy", {
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

export const updateAttendancePolicy = async (data, id) => {
  try {
    const response = await API.put(`/attendance-policy/${id}`, {
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

export const getAttendancePolicy = async (data) => {
  try {
    const response = await API.get("/attendance-policy", {
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

export const getAttendancePolicyList = async (data) => {
  try {
    const response = await API.get("/attendance-policy/all", {
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

export const deleteAttendancePolicy = async (id) => {
  try {
    const response = await API.delete(`/attendance-policy/${id}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
