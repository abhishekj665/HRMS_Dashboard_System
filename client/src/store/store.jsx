import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/auth/authSlices";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
