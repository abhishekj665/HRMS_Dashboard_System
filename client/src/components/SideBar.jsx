import { NavLink } from "react-router-dom";
import {
  Inventory2Outlined,
  CurrencyExchange,
  ManageAccounts,
  PersonAdd,
  Accessibility,
  LocalMall,
  ManageHistory,
  AccessTime,
  CalendarMonth,
  WorkHistory,
  WorkOutline,
  LockPerson,
} from "@mui/icons-material";

import { useSelector } from "react-redux";

export default function Sidebar({ open, setOpen }) {
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
        pb-10
      `}
    >
      
      <div className="px-5 py-4">
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.role?.toUpperCase()} PANEL
        </h1>
      </div>

      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 sidebar-scroll">
       
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
              <ManageHistory fontSize="small" /> Attendance Policy
            </NavLink>

            <NavLink
              to="/admin/attendance"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <AccessTime fontSize="small" /> Attendance Data
            </NavLink>

            <NavLink
              to="/admin/leave-type"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CalendarMonth fontSize="small" /> Leave Types
            </NavLink>

            <NavLink
              to="/admin/leave-policy"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CalendarMonth fontSize="small" /> Leave Policy
            </NavLink>

            <NavLink
              to="/admin/leave-requests"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <CalendarMonth fontSize="small" /> Leave Requests
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
              <WorkHistory fontSize="small" /> Job Requisition
            </NavLink>

            <NavLink
              to="/admin/job-posts"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <WorkOutline fontSize="small" /> Job Posts
            </NavLink>

            <NavLink
              to="/admin/job-applications"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <LockPerson fontSize="small" /> Job Applications
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
