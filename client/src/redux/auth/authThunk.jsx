import { createAsyncThunk } from "@reduxjs/toolkit";

import { signup, login, logOut } from "../../services/AuthService/authService";

import { getProfile } from "../../services/UserService/userService";
import { notifyAuthSessionChanged } from "./authSessionSync";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await signup(userData);
      return response.data || response;
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
      const result = response?.data || response;
      if (result?.success && result?.user && result.user.isVerified !== false) {
        try {
          const profileResponse = await getProfile();
          const profileUser = profileResponse?.user || profileResponse?.data?.user;
          if (profileUser) result.user = profileUser;
        } catch {
          // Login remains successful if the optional profile refresh is unavailable.
        }
        notifyAuthSessionChanged();
      }
      return result;
    } catch (error) {
      console.log("Login error in thunk:", error.response?.data?.message || error.message);
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfile();
      const user = res?.user || res?.data?.user;
      if (!user) {
        return rejectWithValue(res?.message || "Your session has expired");
      }
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data || "fail");
    }
  },
);

export const logOutUser = createAsyncThunk(
  "auth/logOutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logOut();
      if (!response?.success) {
        return rejectWithValue(response?.message || "Failed to logout");
      }
      notifyAuthSessionChanged();
      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to logout",
      );
    }
  },
);
