import HomePage from "./pages/UserLayoutPage";
import AdminUserPage from "./pages/AdminUserPage";
import SignUpPage from "./pages/SignupPage";
import LogInPage from "./pages/LoginPage";
import VerifyPage from "./pages/VerifyPage";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayoutPage from "./pages/AdminLayoutPage";
import AdminIps from "./pages/AdminIp";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import UserAssetPage from "./pages/UserAssetPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/verify" element={<VerifyPage />} />

          <Route path="/admin" element={<AdminLayoutPage />}>
            <Route path="dashboard" element={<AdminUserPage />} />
            <Route path="ips" element={<AdminIps />} />
          </Route>

          <Route path="/" element={<HomePage />}>
            <Route path="assest" element={<UserAssetPage />}></Route>
          </Route>
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
