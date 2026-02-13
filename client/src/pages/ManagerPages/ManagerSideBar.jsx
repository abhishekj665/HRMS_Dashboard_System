import { NavLink } from "react-router-dom";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSelector } from "react-redux";

export default function ManagerSidebar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md transition 
     ${isActive ? "bg-gray-200 text-black" : "text-gray-600 hover:text-black"}`;

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 z-50 h-full w-64 shadow-md
        flex flex-col p-5 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        bg-white
      `}
    >
      <h1 className="text-xl font-bold mb-8 text-gray-800">
        <div className="text-lg font-medium flex italic tracking-tight">
          <p>{user?.role?.toUpperCase()} DASHBOARD</p>
        </div>
      </h1>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/manager/dashboard/users"
          onClick={() => setOpen(false)}
          className={linkClass}
        >
          <PersonAddIcon /> Users
        </NavLink>

        <NavLink
          to="/manager/dashboard/assets"
          onClick={() => setOpen(false)}
          className={linkClass}
        >
          <Inventory2OutlinedIcon /> Assets
        </NavLink>

        <NavLink
          to="/manager/dashboard/requests"
          onClick={() => setOpen(false)}
          className={linkClass}
        >
          <Inventory2OutlinedIcon /> Assets Request
        </NavLink>

        <NavLink
          to="/manager/dashboard/expenses"
          onClick={() => setOpen(false)}
          className={linkClass}
        >
          <CurrencyExchangeIcon /> Expense Requests
        </NavLink>
        <NavLink
          to="/manager/dashboard/attendance"
          onClick={() => setOpen(false)}
          className={linkClass}
        >
          <AccessTimeIcon /> Attendance Data
        </NavLink>
      </nav>
    </aside>
  );
}
