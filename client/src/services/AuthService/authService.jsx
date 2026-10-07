import axios from "axios";
import { loadingRef } from "../../loadingContext";

const baseURL = import.meta.env.VITE_BASE_URL;

export const API = axios.create({
  baseURL,
  withCredentials: true,
});

export const publicAPI = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  loadingRef.set(true);
  return config;
});

publicAPI.interceptors.request.use((config) => {
  loadingRef.set(true);
  return config;
});

API.interceptors.response.use(
  (res) => {
    loadingRef.set(false);
    return res;
  },
  (err) => {
    loadingRef.set(false);
    return Promise.reject(err);
  },
);

publicAPI.interceptors.response.use(
  (res) => {
    loadingRef.set(false);
    return res;
  },
  (err) => {
    loadingRef.set(false);
    return Promise.reject(err);
  },
);

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/verify") ||
      originalRequest.url.includes("/auth/access_token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        await API.post(
          "/auth/access_token",
          {},
          {
            withCredentials: true,
          },
        );

        return API(originalRequest);
      } catch (err) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export const login = async (userData) => {
  try {
    const response = await API.post("/auth/login", userData);

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const signup = async (userData) => {
  try {
    const response = await API.post("/auth/signup", userData);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const verify = async (data) => {
  try {
    const response = await API.post("/auth/verify", data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const logOut = async () => {
  try {
    const response = await API.post("/auth/logout");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await publicAPI.post("/auth/forgot_password", { email });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const resendOtp = async (email, purpose = "FORGOT_PASSWORD") => {
  try {
    const response = await publicAPI.post("/auth/resend_otp", {
      email,
      purpose,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await publicAPI.post("/auth/reset_password", payload);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
