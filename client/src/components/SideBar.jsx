import { NavLink } from "react-router-dom";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PermDataSettingOutlinedIcon from "@mui/icons-material/PermDataSettingOutlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import LocalMallIcon from "@mui/icons-material/LocalMall";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md transition 
     ${isActive ? "bg-gray-200 text-black" : "text-gray-600 hover:text-black"}`;

  return (
    <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-5">
      <h1 className="text-xl font-bold mb-8 text-gray-800">Admin Panel</h1>

      <nav className="flex flex-col gap-2">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <PersonAddIcon /> Users
        </NavLink>

        <NavLink to="/admin/ips" className={linkClass}>
          <AccessibilityIcon /> IPs
        </NavLink>

        <NavLink to="/admin/asset" className={linkClass}>
          <LocalMallIcon /> Assets
        </NavLink>

        <NavLink to="/admin/requests" className={linkClass}>
          <Inventory2OutlinedIcon /> Assets Requests
        </NavLink>

        <NavLink to="/admin/expenses" className={linkClass}>
          <CurrencyExchangeIcon /> Expense Requests
        </NavLink>

        <NavLink to="/admin/manager" className={linkClass}>
          <ManageAccountsIcon /> Managers
        </NavLink>
      </nav>
    </aside>
  );
}
