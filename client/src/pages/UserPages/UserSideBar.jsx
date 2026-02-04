import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

export default function UserSidebar({open, setOpen}) {

  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  if (!user) {
    setTimeout(() => {
      navigate("/login");
      toast.error("Please login to access this page");
    }, 800);

    return;
  }

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
      <h1 className="text-lg font-medium mb-8 text-gray-800 italic tracking-tight">
+        {user?.role?.toUpperCase() ?? "USER"} DASHBOARD
+      </h1>

      <nav className="flex flex-col gap-2">
        <NavLink to="/home/asset" onClick={() => setOpen(false)} className={linkClass}>
          <PendingActionsRoundedIcon /> Assets
        </NavLink>
        <NavLink to="/home/expense" onClick={() => setOpen(false)} className={linkClass}>
          <CurrencyExchangeIcon /> Expense
        </NavLink>
      </nav>
    </aside>
  );
}
