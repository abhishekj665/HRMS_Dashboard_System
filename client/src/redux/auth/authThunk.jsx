import { createAsyncThunk } from "@reduxjs/toolkit";

import { signup, login, logOut } from "./authService";

import { getProfile } from "../../services/userService";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await signup(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
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
  }
);

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfile();
      return data.user;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch user");
    }
  }
);

export const logOutUser = createAsyncThunk(
  "auth/logOutUser",
  async (_, { rejectWithValue }) => {
    try {
      console.log("hello");
      await logOut();
      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to logout"
      );
    }
  }
);
