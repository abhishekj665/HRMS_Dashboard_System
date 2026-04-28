import UserLayoutPage from "./pages/UserPages/UserLayoutPage";
import AdminUserPage from "./pages/AdminPages/User/AdminUserPage";
import AdminDepartmentPage from "./pages/AdminPages/Department/AdminDepartmentPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import LogInPage from "./pages/Auth/LoginPage";

import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayoutPage from "./pages/AdminPages/AdminLayoutPage";
import AdminIps from "./pages/AdminPages/IP/AdminIp";
import UserAssetPage from "./pages/UserPages/UserAssetPage";
import AdminRequest from "./pages/AdminPages/AssetPage/AdminRequest";
import ExpensesPage from "./pages/AdminPages/Expense/ExpensesPage";
import ManagerPage from "./pages/AdminPages/Manager/AdminManagerPage";
import ManagerAsset from "./pages/ManagerPages/AssetPage/ManagerAssetPage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import AdminAsset from "./pages/AdminPages/AssetPage/AdminAsset";
import UserExpensePage from "./pages/UserPages/UserExpensePage";
import ManagerExpensesPage from "./pages/ManagerPages/Expense/ManagerExpenses";
import ManagerLayout from "./pages/ManagerPages/ManagerLayoutPage";
import ManagerUserPage from "./pages/ManagerPages/User/ManagerUserPage";
import ManagerAssetRequest from "./pages/ManagerPages/AssetPage/ManagerRequest";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "./redux/auth/authThunk";
import { socket } from "./socket";
import AttendancePolicy from "./pages/AdminPages/Attendance/AttendancePolicy";
import AttendanceTable from "./pages/AdminPages/Attendance/AttendanceDataPage";
import AttendanceData from "./pages/ManagerPages/Attendance/AttendanceRequestPage";
import UserAttendanceData from "./pages/UserPages/AttendanceData";
import ManagerAttendancePage from "./pages/ManagerPages/Attendance/ManagerAttendancePage";
import LeaveManagement from "./pages/UserPages/LeaveManagementPage";
import ManagerLeaveManagement from "./pages/ManagerPages/LeaveManagement/ManagerLeaveManagement";
import ManagerLeaveDashboard from "./pages/ManagerPages/LeaveManagement/ManagerLeaveDashboard";
import AdminLeaveDashboard from "./pages/AdminPages/LeaveManagement/AdminLeaveDashboard";
import AdminLeavePolicyPage from "./pages/AdminPages/LeaveManagement/LeavePolicyPage";
import LeaveTypePage from "./pages/AdminPages/LeaveManagement/LeaveTypePage";
import CareersPage from "./pages/CareerPages/CareerPage";
import JobDetailPage from "./pages/CareerPages/JobDetailPage";
import JobApplicationPage from "./pages/CareerPages/JobApplicationPage";
import ManagerRequisitionPage from "./pages/ManagerPages/JobRecruitment/JobRequistionPage";
import AdminRequisitionPage from "./pages/AdminPages/Recruitment/AdminRequistionPage";
import AdminJobPostsPage from "./pages/AdminPages/Recruitment/AdminJobPostsPage";
import AdminJobApplicationsPage from "./pages/AdminPages/Recruitment/JobApplicationPage";
import ManagerInterviewsPage from "./pages/ManagerPages/JobRecruitment/interviewPage";
import { OfferPage } from "./pages/CareerPages/OfferPage";
import OrganizationRegisterPage from "./pages/organization/OrganizationRegisterPage";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    const pathname = window.location.pathname;
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/organization/register" ||
      pathname.startsWith("/careers") ||
      pathname.startsWith("/offer/");

    if (isPublicRoute) {
      return;
    }

    dispatch(fetchUser());
  }, []);

  useEffect(() => {
    if (user?.id) {
      if (!socket.connected) {
        socket.connect();
      }
    } else if (socket.connected) {
      socket.disconnect();
    }
  }, [user?.id]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/signup" element={<SignUpPage />} /> */}
          <Route
            path="/organization/register"
            element={<OrganizationRegisterPage />}
          />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/user" element={<UserLayoutPage />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="asset" element={<UserAssetPage />}></Route>
            <Route path="expense" element={<UserExpensePage />}></Route>
            <Route path="attendance" element={<UserAttendanceData />}></Route>
            <Route path="leave-management" element={<LeaveManagement />} />
          </Route>

          <Route path="/admin" element={<AdminLayoutPage />}>
            <Route path="dashboard" element={<AdminUserPage />} />
            <Route path="ips" element={<AdminIps />} />
            <Route path="requests" element={<AdminRequest />} />
            <Route path="asset" element={<AdminAsset />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="manager" element={<ManagerPage />} />
            <Route path="departments" element={<AdminDepartmentPage />} />
            <Route path="attendance-policy" element={<AttendancePolicy />} />
            <Route path="attendance" element={<AttendanceTable />} />
            <Route path="leave-requests" element={<AdminLeaveDashboard />} />
            <Route path="leave-policy" element={<AdminLeavePolicyPage />} />
            <Route path="leave-type" element={<LeaveTypePage />} />
            <Route path="job-requisition" element={<AdminRequisitionPage />} />
            <Route path="job-posts" element={<AdminJobPostsPage />} />
            <Route
              path="job-applications"
              element={<AdminJobApplicationsPage />}
            />
          </Route>

          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<ManagerAsset />} />
            <Route path="users" element={<ManagerUserPage />} />
            <Route path="requests" element={<ManagerAssetRequest />} />
            <Route path="attendance/request" element={<AttendanceData />} />
            <Route path="attendance/me" element={<ManagerAttendancePage />} />
            <Route path="expenses" element={<ManagerExpensesPage />} />
            <Route path="leave-requests" element={<ManagerLeaveDashboard />} />
            <Route
              path="job-requisition"
              element={<ManagerRequisitionPage />}
            />
            <Route
              path="leave/management"
              element={<ManagerLeaveManagement />}
            />
            <Route path="interviews" element={<ManagerInterviewsPage />} />
          </Route>

          <Route path="/offer/:token" element={<OfferPage />} />

          <Route path="/careers" element={<CareersPage />}></Route>
          <Route path="/careers/:orgSlug/:slug" element={<JobDetailPage />} />
          <Route
            path="/careers/:orgSlug/:slug/apply"
            element={<JobApplicationPage />}
          />

          <Route path="/" element={<LogInPage />}></Route>

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
