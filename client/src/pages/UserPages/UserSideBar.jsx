import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  PendingActionsRounded,
  CurrencyExchange,
  AccessTime,
  CalendarMonth,
} from "@mui/icons-material";
import { useEffect } from "react";

export default function UserSidebar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);
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

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 z-50
        h-screen w-64 bg-white border-r
        flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* HEADER */}
      <div className="px-5 py-4">
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.role?.toUpperCase()} PANEL
        </h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 sidebar-scroll">
        {/* ASSETS */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Assets
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/home/asset"
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
              to="/home/expense"
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
              to="/home/attendance"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <AccessTime fontSize="small" /> Attendance
            </NavLink>

            <NavLink
              to="/home/leave-management"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CalendarMonth fontSize="small" /> Leave Management
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
