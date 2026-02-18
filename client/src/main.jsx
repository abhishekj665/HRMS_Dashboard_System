import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.jsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoadingProvider } from "./loadingContext.jsx";
import { GlobalLoader } from "./GlobalLoader.jsx";




createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LoadingProvider>
        <App />
        <GlobalLoader />
      </LoadingProvider>
    </LocalizationProvider>
  </Provider>
);

