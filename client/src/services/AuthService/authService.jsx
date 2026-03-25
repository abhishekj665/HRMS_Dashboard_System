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
  const response = await API.post("/auth/login", userData);

  return response.data;
};

export const signup = async (userData) => {
  const response = await API.post("/auth/signup", userData);
  return response.data;
};

export const verify = async (data) => {
  const response = await API.post("/auth/verify", data);
  return response.data;
};

export const logOut = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};
