import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  ArrowForward,
  CalendarMonth,
  EventAvailable,
  Login,
  Logout,
  NotificationsActive,
  Payments,
  Person,
  ReceiptLong,
  WorkOutline,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  getTodayAttendance,
  punchIn,
  punchOut,
} from "../../services/AttendanceService/attendanceService";
import {
  getAllAttendanceData as getEmployeeAttendanceData,
  getLeaveBalance,
  getLeaveRequests,
} from "../../services/UserService/userService";
import { getAllAttendanceData as getManagerAttendanceData } from "../../services/ManagerService/attendanceService";
import { getAllUserLeaveRequests } from "../../services/ManagerService/leaveService";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatSeconds = (value) => {
  const total = Math.max(0, Number(value) || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const formatMinutes = (value) => {
  const total = Math.max(0, Number(value) || 0);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
};

const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

function MetricCard({ icon, label, value, helper, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 0.75 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: "#0f172a", fontWeight: 800 }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {helper}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3,
            bgcolor: color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        height: "100%",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function MiniCalendar({ approvedDays }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 1,
          mb: 1.25,
        }}
      >
        {WEEK_DAYS.map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{ textAlign: "center", color: "#64748b", fontWeight: 700 }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        {cells.map((day, index) => {
          if (!day) {
            return <Box key={`empty-${index}`} />;
          }

          const isToday = day === now.getDate();
          const isApproved = approvedDays.has(day);

          return (
            <Box
              key={day}
              sx={{
                width: 36,
                height: 36,
                mx: "auto",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: isApproved ? "#dcfce7" : "#f8fafc",
                color: isApproved ? "#166534" : "#334155",
                border: isToday ? "2px solid #2563eb" : "1px solid #e2e8f0",
                fontWeight: isToday || isApproved ? 700 : 500,
                fontSize: 12,
              }}
            >
              {day}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [managerLeaveRequests, setManagerLeaveRequests] = useState([]);
  const [managerAttendanceRequests, setManagerAttendanceRequests] = useState(
    [],
  );
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const isEmployee = user?.role === "employee";
  const isManager = user?.role === "manager";

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const requests = [getTodayAttendance()];
      if (isEmployee) {
        requests.push(getEmployeeAttendanceData({ page: 1, limit: 31 }));
        requests.push(getLeaveBalance());
        requests.push(getLeaveRequests());
      } else if (isManager) {
        requests.push(
          getManagerAttendanceData({
            page: 1,
            limit: 10,
            status: "pending",
            role: "employee",
          }),
        );
        requests.push(
          getAllUserLeaveRequests({
            page: 1,
            limit: 10,
            status: "PENDING",
          }),
        );
      }

      const [todayRes, attendanceRes, leaveBalanceRes, leaveRequestsRes] =
        await Promise.all(requests);

      setAttendanceStatus(todayRes?.success ? todayRes.data : null);

      if (isEmployee) {
        setAttendanceRows(
          attendanceRes?.success ? attendanceRes?.data?.data || [] : [],
        );
        setLeaveBalance(
          leaveBalanceRes?.success ? leaveBalanceRes.data || [] : [],
        );
        setLeaveRequests(
          leaveRequestsRes?.success ? leaveRequestsRes.data || [] : [],
        );
        setManagerAttendanceRequests([]);
        setManagerLeaveRequests([]);
      } else if (isManager) {
        setAttendanceRows([]);
        setLeaveBalance([]);
        setLeaveRequests([]);
        setManagerAttendanceRequests(
          attendanceRes?.success ? attendanceRes?.data?.data || [] : [],
        );
        setManagerLeaveRequests(
          leaveBalanceRes?.success ? leaveBalanceRes.data || [] : [],
        );
      } else {
        setAttendanceRows([]);
        setLeaveBalance([]);
        setLeaveRequests([]);
        setManagerAttendanceRequests([]);
        setManagerLeaveRequests([]);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [isEmployee, isManager]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    if (!attendanceStatus?.lastInAt || attendanceStatus?.punchOutAt) {
      setLiveSeconds(attendanceStatus?.workedSeconds || 0);
      return;
    }

    const updateTime = () => {
      const session = Math.floor(
        (Date.now() - new Date(attendanceStatus.lastInAt).getTime()) / 1000,
      );
      setLiveSeconds((attendanceStatus.workedSeconds || 0) + session);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [attendanceStatus]);

  const handlePunch = async () => {
    const action =
      attendanceStatus?.lastInAt && !attendanceStatus?.punchOutAt
        ? punchOut
        : punchIn;

    const response = await action({ lat, lng });
    if (!response?.success) {
      toast.error(response?.message || "Unable to update attendance");
      return;
    }

    toast.success(response.message);
    loadDashboard();
  };

  const summary = useMemo(() => {
    const rows = attendanceRows.map((item) => item.Attendance).filter(Boolean);
    const approvedDays = new Set();
    let workedMinutes = 0;
    let breakMinutes = 0;
    let present = 0;
    let pending = 0;
    let rejected = 0;

    attendanceRows.forEach((item) => {
      const date = item.Attendance?.punchInAt
        ? new Date(item.Attendance.punchInAt).getDate()
        : null;

      if (item.status === "APPROVED") {
        present += 1;
        if (date) approvedDays.add(date);
      } else if (item.status === "PENDING") {
        pending += 1;
      } else if (item.status === "REJECTED") {
        rejected += 1;
      }
    });

    rows.forEach((row) => {
      workedMinutes += Number(row.workedMinutes || 0);
      breakMinutes += Number(row.breakMinutes || 0);
    });

    const leaveAvailable = leaveBalance.reduce(
      (sum, item) => sum + Number(item.balance || 0),
      0,
    );

    return {
      approvedDays,
      workingDays: rows.length,
      present,
      pending,
      rejected,
      workedMinutes,
      breakMinutes,
      leaveAvailable,
    };
  }, [attendanceRows, leaveBalance]);

  const notifications = useMemo(() => {
    const items = [];

    if (attendanceStatus?.lastInAt && !attendanceStatus?.punchOutAt) {
      items.push({
        type: "success",
        text: `You are punched in since ${formatTime(attendanceStatus.lastInAt)}.`,
      });
    } else {
      items.push({
        type: "info",
        text: "You are currently punched out. Start your day from the dashboard.",
      });
    }

    if (isEmployee) {
      const pendingLeaves = leaveRequests.filter(
        (item) => item.status === "PENDING",
      ).length;
      items.push({
        type: pendingLeaves > 0 ? "warning" : "info",
        text:
          pendingLeaves > 0
            ? `${pendingLeaves} leave request${pendingLeaves > 1 ? "s are" : " is"} pending approval.`
            : "No pending leave requests right now.",
      });
    } else if (isManager) {
      const pendingLeaveApprovals = managerLeaveRequests.filter(
        (item) => item.status === "PENDING",
      ).length;
      const pendingAttendanceApprovals = managerAttendanceRequests.filter(
        (item) => item.status === "PENDING",
      ).length;

      items.push({
        type: pendingLeaveApprovals > 0 ? "warning" : "info",
        text:
          pendingLeaveApprovals > 0
            ? `${pendingLeaveApprovals} leave request${pendingLeaveApprovals > 1 ? "s are" : " is"} waiting for your approval.`
            : "No pending leave requests need your review.",
      });

      items.push({
        type: pendingAttendanceApprovals > 0 ? "warning" : "info",
        text:
          pendingAttendanceApprovals > 0
            ? `${pendingAttendanceApprovals} attendance request${pendingAttendanceApprovals > 1 ? "s are" : " is"} waiting for your action.`
            : "No pending attendance requests need your review.",
      });
    }

    return items;
  }, [
    attendanceStatus,
    isEmployee,
    isManager,
    leaveRequests,
    managerLeaveRequests,
    managerAttendanceRequests,
  ]);

  const quickActions = [
    {
      label: "Attendance",
      icon: <AccessTime fontSize="small" />,
      path: isEmployee ? "/user/attendance" : "/manager/attendance/me",
    },
    {
      label: "Leave Management",
      icon: <CalendarMonth fontSize="small" />,
      path: isEmployee ? "/user/leave-management" : "/manager/leave/management",
    },
    {
      label: "Expenses",
      icon: <Payments fontSize="small" />,
      path: isEmployee ? "/user/expense" : "/manager/expenses",
    },
    ...(
      isManager
        ? [
            {
              label: "Attendance Requests",
              icon: <EventAvailable fontSize="small" />,
              path: "/manager/attendance/request",
            },
            {
              label: "Leave Requests",
              icon: <ReceiptLong fontSize="small" />,
              path: "/manager/leave-requests",
            },
          ]
        : []
    ),
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100%", p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1440, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            color: "#fff",
            background:
              "linear-gradient(135deg, #0f2d5c 0%, #1d4f91 52%, #3b82f6 100%)",
            mb: 3,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 35%)",
            }}
          />
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
            sx={{ position: "relative" }}
          >
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.78 }}>
                {user?.role || "dashboard"}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                Welcome,{" "}
                {user?.firstName ||
                  user?.name ||
                  user?.email.split("@")[0] ||
                  "User"}
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 640, opacity: 0.88 }}>
                Track attendance, leave balance, working hours, notifications,
                and your next actions from one place.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                minWidth: { xs: "100%", lg: 320 },
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.84 }}>
                    Today's Working Time
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.75 }}>
                    {formatSeconds(liveSeconds)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.84 }}>
                    Punch in at {formatTime(attendanceStatus?.lastInAt)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.18)" }}>
                  <Person />
                </Avatar>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={handlePunch}
                startIcon={
                  attendanceStatus?.lastInAt &&
                  !attendanceStatus?.punchOutAt ? (
                    <Logout />
                  ) : (
                    <Login />
                  )
                }
                sx={{
                  mt: 2,
                  bgcolor:
                    attendanceStatus?.lastInAt && !attendanceStatus?.punchOutAt
                      ? "#ef4444"
                      : "#22c55e",
                  "&:hover": {
                    bgcolor:
                      attendanceStatus?.lastInAt &&
                      !attendanceStatus?.punchOutAt
                        ? "#dc2626"
                        : "#16a34a",
                  },
                  py: 1.1,
                  borderRadius: 2.5,
                  fontWeight: 800,
                }}
              >
                {attendanceStatus?.lastInAt && !attendanceStatus?.punchOutAt
                  ? "Punch Out"
                  : "Punch In"}
              </Button>
            </Paper>
          </Stack>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<CalendarMonth />}
              label="Working Days"
              value={summary.workingDays}
              helper="Attendance records this cycle"
              color="#2563eb"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<EventAvailable />}
              label="Present Days"
              value={summary.present}
              helper="Approved attendance entries"
              color="#16a34a"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<ReceiptLong />}
              label="Leave Balance"
              value={summary.leaveAvailable}
              helper="Available leave days"
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<AccessTime />}
              label="Worked Hours"
              value={formatMinutes(summary.workedMinutes)}
              helper={`Break time ${formatMinutes(summary.breakMinutes)}`}
              color="#7c3aed"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} xl={8}>
            <SectionCard
              title="Attendance Overview"
              subtitle="Monthly presence snapshot and approval status"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <MiniCalendar approvedDays={summary.approvedDays} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Stack spacing={1.25}>
                    <Alert severity="success" variant="outlined">
                      Approved: {summary.present}
                    </Alert>
                    <Alert severity="warning" variant="outlined">
                      Pending: {summary.pending}
                    </Alert>
                    <Alert severity="error" variant="outlined">
                      Rejected: {summary.rejected}
                    </Alert>
                    <Alert severity="info" variant="outlined">
                      Latest punch in: {formatTime(attendanceStatus?.lastInAt)}
                    </Alert>
                  </Stack>
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6} xl={4}>
            <SectionCard
              title="Current Project"
              subtitle="Assignment and workload status"
            >
              <Box
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  minHeight: 240,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#dbeafe", color: "#1d4ed8" }}>
                    <WorkOutline />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      Project Not Assigned
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Update this card once project mapping is available from
                      the backend.
                    </Typography>
                    <Chip
                      label="Awaiting Allocation"
                      size="small"
                      sx={{
                        mt: 1.5,
                        bgcolor: "#fee2e2",
                        color: "#b91c1c",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={7}>
            <SectionCard
              title="Notifications"
              subtitle="Operational updates you should not miss"
              action={<NotificationsActive sx={{ color: "#2563eb" }} />}
            >
              <Stack spacing={1.5} sx={{ py: 1 }}>
                {notifications.map((item, index) => (
                  <Alert key={index} severity={item.type} variant="filled">
                    {item.text}
                  </Alert>
                ))}
              </Stack>
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6} lg={5}>
            <SectionCard
              title="Quick Actions"
              subtitle="Jump straight into common tasks"
            >
              <Stack spacing={1.5} sx={{ py: 1 }}>
                {quickActions.map((action) => (
                  <Paper
                    key={action.label}
                    variant="outlined"
                    onClick={() => navigate(action.path)}
                    sx={{
                      px: 2.25,
                      py: 1.75,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all .15s ease",
                      "&:hover": { bgcolor: "#f8fafc", borderColor: "#bfdbfe" },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#eff6ff",
                          color: "#2563eb",
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {action.label}
                      </Typography>
                    </Stack>
                    <ArrowForward sx={{ color: "#64748b" }} />
                  </Paper>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
