import { createAsyncThunk } from "@reduxjs/toolkit";

import { signup, login } from "./authService";

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