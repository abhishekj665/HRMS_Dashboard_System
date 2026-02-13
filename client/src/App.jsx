import HomePage from "./pages/UserPages/UserLayoutPage";
import AdminUserPage from "./pages/AdminPages/AdminUserPage";
import SignUpPage from "./pages/Auth/SignupPage";
import LogInPage from "./pages/Auth/LoginPage";

import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayoutPage from "./pages/AdminPages/AdminLayoutPage";
import AdminIps from "./pages/AdminPages/AdminIp";
import UserAssetPage from "./pages/UserPages/UserAssetPage";
import AdminRequest from "./pages/AdminPages/AdminRequest";
import ExpensesPage from "./pages/AdminPages/ExpensesPage";
import ManagerPage from "./pages/AdminPages/AdminManagerPage";
import ManagerAsset from "./pages/ManagerPages/ManagerAssetPage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import AdminAsset from "./pages/AdminPages/AdminAsset";
import UserExpensePage from "./pages/UserPages/UserExpensePage";
import ManagerExpensesPage from "./pages/ManagerPages/ManagerExpenses";
import ManagerLayout from "./pages/ManagerPages/ManagerLayoutPage";
import ManagerUserPage from "./pages/ManagerPages/ManagerUserPage";
import ManagerAssetRequest from "./pages/ManagerPages/ManagerRequest";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./redux/auth/authThunk";
import AttendancePolicy from "./pages/AdminPages/AttendancePolicy";
import AttendanceTable from "./pages/AdminPages/AttendanceDataPage";
import AttendanceData from "./pages/ManagerPages/AttendanceData";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser());
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/home" element={<HomePage />}>
            <Route path="asset" element={<UserAssetPage />}></Route>
            <Route path="expense" element={<UserExpensePage />}></Route>
          </Route>

          <Route path="/admin" element={<AdminLayoutPage />}>
            <Route path="dashboard" element={<AdminUserPage />} />
            <Route path="ips" element={<AdminIps />} />
            <Route path="requests" element={<AdminRequest />} />
            <Route path="asset" element={<AdminAsset />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="manager" element={<ManagerPage />} />
            <Route path="attendance-policy" element={<AttendancePolicy />} />
            <Route path="attendance" element={<AttendanceTable />} />
          </Route>

          <Route path="/manager/dashboard" element={<ManagerLayout />}>
            <Route path="assets" element={<ManagerAsset />} />
            <Route path="users" element={<ManagerUserPage />} />
            <Route path="requests" element={<ManagerAssetRequest />} />
            <Route path="attendance" element={<AttendanceData />} />

            <Route path="expenses" element={<ManagerExpensesPage />} />
          </Route>

          <Route path="/" element={<SignUpPage />}></Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        toastStyle={{
          width: "280px",
          height: "1vh",
        }}
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
}

export default App;
