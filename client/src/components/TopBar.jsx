import { Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { logOutUser } from "../redux/auth/authThunk";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

export default function Topbar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      const result = await dispatch(logOutUser()).unwrap();

      toast.success("Logged out successfully");
      navigate("/login");
      return;
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  return (
    <div className="h-16 shadow flex border-b items-center justify-between px-3 bg-white">
      <div className="flex items-center mr-5 gap-2">
        <div className="md:hidden">
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-sm text-gray-500">
          {user?.email || user?.name || ""}
        </div>
        <Button onClick={handleLogOut}>LogOut</Button>
      </div>
    </div>
  );
}
