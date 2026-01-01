import axios from "axios";

axios.defaults.withCredentials = true;

export const API = axios.create({
  baseURL: "http://localhost:3000",
});

export const login = async (userData) => {
  const response = await API.post("/auth/login", userData);
  return response.data;
};

export const signup = async (userData) => {
  const response = await API.post("/auth/signup", userData);
  return response.data;
};
