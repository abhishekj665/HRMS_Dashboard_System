import { NavLink } from "react-router-dom";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function ManagerSidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md transition 
     ${isActive ? "bg-gray-200 text-black" : "text-gray-600 hover:text-black"}`;

  return (
    <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-5">
      <h1 className="text-xl font-bold mb-8 text-gray-800">Manager Panel</h1>

      <nav className="flex flex-col gap-2">
        <NavLink to="/manager/dashboard/users" className={linkClass}>
          <PersonAddIcon /> Users
        </NavLink>

        <NavLink to="/manager/dashboard/assets" className={linkClass}>
          <Inventory2OutlinedIcon /> Assets
        </NavLink>

        <NavLink to="/manager/dashboard/requests" className={linkClass}>
          <Inventory2OutlinedIcon /> Assets Request
        </NavLink>

        <NavLink to="/manager/dashboard/expenses" className={linkClass}>
          <CurrencyExchangeIcon /> Expense Requests
        </NavLink>
      </nav>
    </aside>
  );
}
