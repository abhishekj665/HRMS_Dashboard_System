import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { logOutUser } from "../redux/auth/authThunk";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Switch } from "@mui/material";
import { useState } from "react";
import { FormControlLabel, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  punchOut,
  getTodayAttendance,
} from "../services/AttendanceService/attendanceService";
import { punchIn } from "../services/AttendanceService/attendanceService";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Topbar({ open, setOpen }) {
  const user = useSelector((state) => state.auth.user);

  const [punch, setPunch] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);

  const [baseSeconds, setBaseSeconds] = useState(0);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const setTimer = () => {
    if (!punchInTime) return;

    const now = Date.now();

    const sessionSeconds = Math.floor((now - punchInTime) / 1000);
    const totalSeconds = baseSeconds + sessionSeconds;

    setHours(Math.floor(totalSeconds / 3600));
    setMinutes(Math.floor((totalSeconds % 3600) / 60));
    setSeconds(totalSeconds % 60);
  };

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
  const handlePunch = async () => {
    if (punch) {
      const response = await punchOut({ lat, lng });

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      await loadStatus();
      return;
    }

    const response = await punchIn({ lat, lng });

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    await loadStatus();
  };

  const loadStatus = async () => {
    const res = await getTodayAttendance();

    if (res.success && res.data) {
      const { workedSeconds, lastInAt, punchOutAt } = res.data;
      setBaseSeconds(workedSeconds || 0);

      const active = lastInAt && punchOutAt === null;

      setPunch(active);

      if (active) {
        const lastInMs = new Date(lastInAt).getTime();
        setPunchInTime(lastInMs);

        const now = Date.now();
        const sessionSeconds = Math.floor((now - lastInMs) / 1000);
        const totalSeconds = (workedSeconds || 0) + sessionSeconds;

        setHours(Math.floor(totalSeconds / 3600));
        setMinutes(Math.floor((totalSeconds % 3600) / 60));
        setSeconds(totalSeconds % 60);
      } else {
        setPunchInTime(null);
      }
    } else {
      setPunch(false);
      setPunchInTime(null);
      setBaseSeconds(0);
    }
  };

  function getLocation() {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);
      },
      (error) => {
        console.error("Location error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  useEffect(() => {
    loadStatus();
    getLocation();
  }, []);

  useEffect(() => {
    if (!punchInTime) return;

    setTimer();
    const interval = setInterval(setTimer, 1000);
    return () => clearInterval(interval);
  }, [punchInTime, baseSeconds]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="h-16 shadow flex items-center justify-between px-2">
      <div className="flex items-center mr-5 gap-2">
        <div className="md:hidden">
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>
        </div>
      </div>
      <FormControlLabel
        control={
          <div style={{ display: "flex", alignItems: "center" }}>
            {punch ? "Punch Out" : "Punch In"}
            <Switch checked={punch} onChange={handlePunch} />
            <span style={{ marginLeft: "5px" }}>
              {punch ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : ""}
            </span>
          </div>
        }
      />

      <Button onClick={handleLogOut}>LogOut</Button>
    </div>
  );
}
