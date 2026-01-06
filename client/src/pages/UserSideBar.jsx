import { NavLink } from "react-router-dom";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";

export default function UserSidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md transition 
     ${isActive ? "bg-gray-200 text-black" : "text-gray-600 hover:text-black"}`;

  return (
    <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-5">
      <h1 className="text-xl font-bold mb-8 text-gray-800">User Panel</h1>

      <nav className="flex flex-col gap-2">
        <NavLink to="/assest" className={linkClass}>
          <PendingActionsRoundedIcon /> Assets
        </NavLink>
      </nav>
    </aside>
  );
}
