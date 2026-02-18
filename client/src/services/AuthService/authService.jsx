import axios from "axios";
import { loadingRef } from "../../loadingContext";

export const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
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
  }
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
