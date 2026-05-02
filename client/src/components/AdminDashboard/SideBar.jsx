import { NavLink, useNavigate } from "react-router-dom";
import {
  Inventory2Outlined,
  CurrencyExchange,
  ManageAccounts,
  PersonAdd,
  Accessibility,
  LocalMall,
  FactCheck,
  AccessTimeFilled,
  Category,
  Policy,
  AssignmentTurnedIn,
  Assignment,
  Campaign,
  HowToReg,
  Apartment,
  LogoutOutlined,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { logOutUser } from "../../redux/auth/authThunk";
import { toast } from "react-toastify";

export default function Sidebar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
     ${
       isActive
         ? "bg-blue-50 text-blue-600 font-medium"
         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
     }`;

  const handleLogOut = async () => {
    try {
      await dispatch(logOutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  const initials =
    `${user?.firstName?.[0] || user?.name?.[0] || "A"}`.toUpperCase();

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 z-50
        h-screen w-64 bg-white border-r
        flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        pb-2
      `}
    >
      <div className="px-5 py-4">
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.role?.toUpperCase()} DASHBOARD
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-6 sidebar-scroll">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            User Management
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/admin/dashboard"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <PersonAdd fontSize="small" /> Users
            </NavLink>

            <NavLink
              to="/admin/manager"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <ManageAccounts fontSize="small" /> Managers
            </NavLink>

            <NavLink
              to="/admin/departments"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Apartment fontSize="small" /> Departments
            </NavLink>

            <NavLink
              to="/admin/ips"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Accessibility fontSize="small" /> IPs
            </NavLink>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Assets & Finance
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/admin/asset"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <LocalMall fontSize="small" /> Assets
            </NavLink>

            <NavLink
              to="/admin/requests"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Inventory2Outlined fontSize="small" /> Asset Requests
            </NavLink>

            <NavLink
              to="/admin/expenses"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CurrencyExchange fontSize="small" /> Expense Requests
            </NavLink>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Attendance & Leave
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/admin/attendance-policy"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <FactCheck fontSize="small" /> Attendance Policy
            </NavLink>

            <NavLink
              to="/admin/attendance"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <AccessTimeFilled fontSize="small" /> Attendance Data
            </NavLink>

            <NavLink
              to="/admin/leave-type"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Category fontSize="small" /> Leave Types
            </NavLink>

            <NavLink
              to="/admin/leave-policy"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Policy fontSize="small" /> Leave Policy
            </NavLink>

            <NavLink
              to="/admin/leave-requests"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <AssignmentTurnedIn fontSize="small" /> Leave Requests
            </NavLink>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Hiring
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/admin/job-requisition"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Assignment fontSize="small" /> Job Requisition
            </NavLink>

            <NavLink
              to="/admin/job-posts"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Campaign fontSize="small" /> Job Posts
            </NavLink>

            <NavLink
              to="/admin/job-applications"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <HowToReg fontSize="small" /> Job Applications
            </NavLink>
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-3 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 grid place-items-center font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-gray-900 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || "Admin"}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {user?.role || "admin"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogOut}
          style={{cursor : "pointer", marginBottom: "0.75rem" }}
          className="w-full h-11  text-gray-800 font-semibold text-base flex items-center justify-start px-4 gap-2 hover:bg-gray-50"
        >
          <LogoutOutlined fontSize="small" /> Log Out
        </button>
      </div>
    </aside>
  );
}
