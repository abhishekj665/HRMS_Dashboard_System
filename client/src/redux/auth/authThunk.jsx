import { createAsyncThunk } from "@reduxjs/toolkit";

import { signup, login, logOut } from "../../services/AuthService/authService";

import { getProfile } from "../../services/UserService/userService";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await signup(userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await login(loginData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfile();

      return res?.user || res?.data?.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || "fail");
    }
  },
);

export const logOutUser = createAsyncThunk(
  "auth/logOutUser",
  async (_, { rejectWithValue }) => {
    try {
      await logOut();
      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to logout",
      );
    }
  },
);
