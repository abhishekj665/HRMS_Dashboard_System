import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PermDataSettingOutlinedIcon from "@mui/icons-material/PermDataSettingOutlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md transition 
     ${isActive ? "bg-gray-200 text-black" : "text-gray-600 hover:text-black"}`;

  return (
    <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-5">
      <h1 className="text-xl font-bold mb-8 text-gray-800">Admin Panel</h1>

      <nav className="flex flex-col gap-2">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <PersonIcon /> Users
        </NavLink>

        <NavLink to="/admin/ips" className={linkClass}>
          <PersonIcon /> IPs
        </NavLink>

        <NavLink to="/admin/asset" className={linkClass}>
          <PermDataSettingOutlinedIcon /> Assets
        </NavLink>

        <NavLink to="/admin/requests" className={linkClass}>
          <Inventory2OutlinedIcon /> Assest Requests
        </NavLink>

        <NavLink to="/admin/expenses" className={linkClass}>
          <CurrencyExchangeIcon /> Expenses
        </NavLink>
      </nav>
    </aside>
  );
}
