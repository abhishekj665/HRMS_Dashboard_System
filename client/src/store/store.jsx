import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "../redux/auth/authSlices";

const rootReducer = combineReducers({
  auth: authReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
