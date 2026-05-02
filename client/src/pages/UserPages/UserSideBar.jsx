import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  PendingActionsRounded,
  CurrencyExchange,
  AccessTimeFilled,
  EventNote,
  LogoutOutlined,
} from "@mui/icons-material";
import { useEffect } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { logOutUser } from "../../redux/auth/authThunk";

export default function UserSidebar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please login to access this page");
      navigate("/login");
    }
  }, [user, navigate]);

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

  const initials = `${user?.firstName?.[0] || user?.name?.[0] || "U"}`.toUpperCase();

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 z-50
        h-[100dvh] md:h-screen w-64 bg-white border-r overflow-hidden
        flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* HEADER */}
      <div className="px-5 py-4">
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.role?.toUpperCase()} DASHBOARD
        </h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-6 sidebar-scroll">
        {/* DASHBOARD */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Dashboard
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/user/dashboard"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <DashboardIcon fontSize="small" /> Dashboard
            </NavLink>
          </div>
        </div>
        {/* ASSETS */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Assets
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/user/asset"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <PendingActionsRounded fontSize="small" /> Assets
            </NavLink>
          </div>
        </div>

        {/* FINANCE */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Finance
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/user/expense"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CurrencyExchange fontSize="small" /> Expense
            </NavLink>
          </div>
        </div>

        {/* ATTENDANCE & LEAVE */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Attendance & Leave
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/user/attendance"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <AccessTimeFilled fontSize="small" /> Attendance
            </NavLink>

            <NavLink
              to="/user/leave-management"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <EventNote fontSize="small" /> Leave Management
            </NavLink>
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-3 bg-white shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 grid place-items-center font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-gray-900 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || "User"}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {user?.role || "employee"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogOut}
          style={{ cursor: "pointer" }}
          className="w-full h-11  text-gray-800 font-semibold text-base flex items-center justify-start px-4 gap-2 hover:bg-gray-50"

        >
          <LogoutOutlined fontSize="small" /> Log Out
        </button>
      </div>
    </aside>
  );
}
