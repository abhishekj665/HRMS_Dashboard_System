import SignUpPage from "./pages/SignUpPage";
import LogInPage from "./pages/LogInPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        className="w-2/5"
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
}

export default App;
