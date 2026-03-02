import { NavLink } from "react-router-dom";
import {
  Inventory2Outlined,
  CurrencyExchange,
  PersonAdd,
  AccessTime,
  RequestPage,
  CalendarMonth,
  WorkHistory,
} from "@mui/icons-material";
import { EventAvailable } from "@mui/icons-material";

import { useSelector } from "react-redux";

export default function ManagerSidebar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);

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
      <div className="px-5 py-4 ">
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.role?.toUpperCase()} PANEL
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 sidebar-scroll">
        {/* TEAM */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Team
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/manager/dashboard/users"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <PersonAdd fontSize="small" /> Users
            </NavLink>
          </div>
        </div>

        {/* ASSETS & EXPENSES */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Assets & Finance
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/manager/dashboard/assets"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Inventory2Outlined fontSize="small" /> Assets
            </NavLink>

            <NavLink
              to="/manager/dashboard/requests"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Inventory2Outlined fontSize="small" /> Asset Requests
            </NavLink>

            <NavLink
              to="/manager/dashboard/expenses"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CurrencyExchange fontSize="small" /> Expense Requests
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
              to="/manager/dashboard/attendance/request"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <RequestPage fontSize="small" /> Attendance Request
            </NavLink>

            <NavLink
              to="/manager/dashboard/attendance/me"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <AccessTime fontSize="small" /> Attendance
            </NavLink>

            <NavLink
              to="/manager/dashboard/leave/management"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CalendarMonth fontSize="small" /> Leave Management
            </NavLink>

            <NavLink
              to="/manager/dashboard/leave-requests"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CalendarMonth fontSize="small" /> Leave Requests
            </NavLink>
          </div>
        </div>

        {/* HIRING */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Hiring
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/manager/dashboard/job-requisition"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <WorkHistory fontSize="small" /> Job Requisition
            </NavLink>

            <NavLink
              to="/manager/dashboard/interviews"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <EventAvailable fontSize="small" /> Job Interviews
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
