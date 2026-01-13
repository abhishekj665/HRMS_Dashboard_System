import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { logOutUser } from "../redux/auth/authThunk";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogOut = async () => {
    try {
      
      const result = await dispatch(logOutUser()).unwrap();

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <Button onClick={handleLogOut}>LogOut</Button>
    </div>
  );
}
