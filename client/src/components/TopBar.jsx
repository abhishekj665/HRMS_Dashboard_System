import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { logOutUser } from "../redux/auth/authThunk";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Switch } from "@mui/material";
import { useState } from "react";
import { FormControlLabel } from "@mui/material";
import { punchOut } from "../services/attendanceService";
import { punchIn } from "../services/attendanceService";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Topbar() {
  const user = useSelector((state) => state.auth.user);

  const [punch, setPunch] = useState(user?.punchInAt || false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [punchInTime, setPunchInTime] = useState(
    user?.punchInAt ? new Date(user.punchInAt).getTime() : null,
  );

  const setTimer = () => {
    const now = Date.now();
    const diff = now - punchInTime;
    const totalSeconds = Math.floor(diff / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
  };

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
  const handlePunch = async () => {
    if (punch) {
      let response = await punchOut();

      if (response.success) {
        setPunchInTime(null);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setPunch(false);
        toast.success(response.message);
        return;
      }
    } else {
      let response = await punchIn();
      if (response.success) {
      
        const serverTime = new Date(response.data).getTime();
        
        setPunchInTime(serverTime);
        setPunch(true);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    }
  };

  useEffect(() => {
    if (!punchInTime) return;

    const interval = setInterval(() => {
      setTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime]);

  if (user === null) {
    return null;
  }

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <h1>Welcome &nbsp; {user?.email?.split("@")[0]}</h1>

      <FormControlLabel
        control={
          <div style={{ display: "flex", alignItems: "center" }}>
            {punch ? "Punch Out" : "Punch In"}
            <Switch checked={punch} onClick={handlePunch} />
            <span style={{ marginLeft: "10px" }}>
              {punch ? `${hours}h : ${minutes}m : ${seconds}s` : ""}
            </span>
          </div>
        }
      />

      <Button onClick={handleLogOut}>LogOut</Button>
    </div>
  );
}
