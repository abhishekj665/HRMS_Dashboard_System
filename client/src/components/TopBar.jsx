import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { logOutUser } from "../redux/auth/authThunk";
import { toast } from "react-toastify";

export default function Topbar({ open, setOpen }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  const fullName = useMemo(() => {
    const first = user?.firstName || user?.first_name || "";
    const last = user?.lastName || user?.last_name || "";
    return `${first} ${last}`.trim() || user?.name || "Admin User";
  }, [user]);

  const initials = useMemo(() => {
    const source = fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return source || "AU";
  }, [fullName]);

  const handleLogout = async () => {
    try {
      await dispatch(logOutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  return (
    <div className="h-14 md:h-16 border-b border-slate-200 flex items-center justify-between px-2 md:px-4 bg-white">
      <div className="flex items-center gap-2">
        <IconButton
          onClick={() => setOpen(!open)}
          disabled={isDesktop}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <div className="hidden md:block">
          <p className="text-xs uppercase tracking-wider text-slate-400">Workspace</p>
          <p className="text-sm font-semibold text-slate-800">Administration Panel</p>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 transition"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: "#dbeafe", color: "#1d4ed8", fontSize: 13, fontWeight: 700 }}>
          {initials}
        </Avatar>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-900 leading-4">{fullName}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role || "admin"}</p>
        </div>
        <KeyboardArrowDownIcon sx={{ color: "#64748b", fontSize: 20 }} />
      </button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate("/admin/profile");
          }}
        >
          <AccountCircleOutlinedIcon sx={{ mr: 1.2, fontSize: 20, color: "#334155" }} />
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate("/admin/subscription/payment");
          }}
        >
          <WorkspacePremiumOutlinedIcon sx={{ mr: 1.2, fontSize: 20, color: "#334155" }} />
          Subscription
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setAnchorEl(null);
            await handleLogout();
          }}
        >
          <LogoutOutlinedIcon sx={{ mr: 1.2, fontSize: 20, color: "#b91c1c" }} />
          Log Out
        </MenuItem>
      </Menu>
    </div>
  );
}
