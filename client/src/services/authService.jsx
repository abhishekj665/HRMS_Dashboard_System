import axios from "axios";

axios.defaults.withCredentials = true;

export const API = axios.create({
  baseURL: "http://localhost:3000",
});

//import.meta.env.VITE_BASE_URL



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
