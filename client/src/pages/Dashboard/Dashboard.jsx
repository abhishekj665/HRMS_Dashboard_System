import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
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
  NotificationsNone,
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
import { getManagerInterviews } from "../../services/JobRecruitmentService/interviewService";

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

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString([], {
        day: "2-digit",
        month: "short",
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
  const [punchLoading, setPunchLoading] = useState(false);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [managerLeaveRequests, setManagerLeaveRequests] = useState([]);
  const [managerAttendanceRequests, setManagerAttendanceRequests] = useState(
    [],
  );
  const [managerInterviews, setManagerInterviews] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [quickActionAnchorEl, setQuickActionAnchorEl] = useState(null);
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
        requests.push(
          getManagerInterviews({
            page: 1,
            limit: 10,
          }),
        );
      }

      const [
        todayRes,
        attendanceRes,
        leaveBalanceRes,
        leaveRequestsRes,
        interviewsRes,
      ] = await Promise.all(requests);

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
        setManagerInterviews([]);
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
        setManagerInterviews(
          interviewsRes?.success ? interviewsRes?.data?.rows || [] : [],
        );
      } else {
        setAttendanceRows([]);
        setLeaveBalance([]);
        setLeaveRequests([]);
        setManagerAttendanceRequests([]);
        setManagerLeaveRequests([]);
        setManagerInterviews([]);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const refreshTodayStatus = async () => {
    const todayRes = await getTodayAttendance();
    setAttendanceStatus(todayRes?.success ? todayRes.data : null);
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

    setPunchLoading(true);
    try {
      const response = await action({ lat, lng });
      if (!response?.success) {
        toast.error(response?.message || "Unable to update attendance");
        return;
      }

      toast.success(response.message);
      await refreshTodayStatus();
    } finally {
      setPunchLoading(false);
    }
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
        path: null,
      });
    } else if (isEmployee) {
      items.push({
        type: "info",
        text: "You are currently punched out. Start your day from the dashboard.",
        path: null,
      });
    }

    if (isEmployee) {
      const pendingLeaves = leaveRequests.filter(
        (item) => item.status === "PENDING",
      ).length;
      if (pendingLeaves > 0) {
        items.push({
          type: "warning",
          text: `${pendingLeaves} leave request${pendingLeaves > 1 ? "s are" : " is"} pending approval.`,
          path: "/user/leave-management",
        });
      }
    } else if (isManager) {
      const pendingLeaveApprovals = managerLeaveRequests.filter(
        (item) => item.status === "PENDING",
      ).length;
      const pendingAttendanceApprovals = managerAttendanceRequests.filter(
        (item) => item.status === "PENDING",
      ).length;
      const pendingInterviewConfirmations = managerInterviews.filter(
        (item) => item.status === "PENDING_CONFIRMATION",
      );
      const upcomingInterviews = managerInterviews.filter((item) => {
        if (!["SCHEDULED", "RESCHEDULED"].includes(item.status)) return false;

        const scheduledTime = new Date(item.scheduledAt).getTime();
        const now = Date.now();
        return scheduledTime >= now && scheduledTime <= now + 86400000;
      });

      if (pendingLeaveApprovals > 0) {
        items.push({
          type: "warning",
          text: `${pendingLeaveApprovals} leave request${pendingLeaveApprovals > 1 ? "s are" : " is"} waiting for your approval.`,
          path: "/manager/leave-requests",
        });
      }

      if (pendingAttendanceApprovals > 0) {
        items.push({
          type: "warning",
          text: `${pendingAttendanceApprovals} attendance request${pendingAttendanceApprovals > 1 ? "s are" : " is"} waiting for your action.`,
          path: "/manager/attendance/request",
        });
      }

      pendingInterviewConfirmations.slice(0, 3).forEach((item) => {
        items.push({
          type: "info",
          text: `Interview confirmation needed for ${item.application?.candidate?.firstName || "candidate"} on ${formatDateTime(item.scheduledAt)}.`,
          path: "/manager/interviews",
        });
      });

      upcomingInterviews.slice(0, 3).forEach((item) => {
        items.push({
          type: "success",
          text: `Upcoming ${item.roundName || "interview"} with ${item.application?.candidate?.firstName || "candidate"} at ${formatDateTime(item.scheduledAt)}.`,
          path: "/manager/interviews",
        });
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
    managerInterviews,
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
            {
              label: "Interviews",
              icon: <NotificationsActive fontSize="small" />,
              path: "/manager/interviews",
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
                <Stack spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.84,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Notification
                  </Typography>
                  <IconButton
                    onClick={(event) =>
                      setNotificationAnchorEl(event.currentTarget)
                    }
                    sx={{
                      width: 54,
                      height: 54,
                      border: "1px solid rgba(255,255,255,0.18)",
                      bgcolor: "rgba(255,255,255,0.16)",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.24)",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={notifications.length}
                      color="error"
                      max={99}
                    >
                      <NotificationsActive />
                    </Badge>
                  </IconButton>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePunch}
                  disabled={punchLoading}
                  startIcon={
                    attendanceStatus?.lastInAt &&
                    !attendanceStatus?.punchOutAt ? (
                      <Logout />
                    ) : (
                      <Login />
                    )
                  }
                  sx={{
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
                  {punchLoading
                    ? "Please wait..."
                    : attendanceStatus?.lastInAt && !attendanceStatus?.punchOutAt
                      ? "Punch Out"
                      : "Punch In"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={(event) => setQuickActionAnchorEl(event.currentTarget)}
                  sx={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.28)",
                    bgcolor: "rgba(255,255,255,0.08)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.45)",
                      bgcolor: "rgba(255,255,255,0.14)",
                    },
                    py: 1.1,
                    borderRadius: 2.5,
                    fontWeight: 800,
                  }}
                >
                  Quick Actions
                </Button>
              </Stack>
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
          <Grid item xs={12} lg={8}>
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

          <Grid item xs={12} lg={4}>
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

        </Grid>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={() => setNotificationAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 400,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.14)",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.75, bgcolor: "#f8fafc" }}>
            <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {notifications.length > 0
                ? `${notifications.length} update${notifications.length > 1 ? "s" : ""} available`
                : "You're all caught up."}
            </Typography>
          </Box>
          <Divider />
          {notifications.length > 0 ? (
            notifications.map((item, index) => (
              <MenuItem
                key={`${item.text}-${index}`}
                onClick={() => {
                  setNotificationAnchorEl(null);
                  if (item.path) navigate(item.path);
                }}
                sx={{
                  py: 1.75,
                  px: 2,
                  alignItems: "flex-start",
                  whiteSpace: "normal",
                  borderBottom:
                    index === notifications.length - 1
                      ? "none"
                      : "1px solid #f1f5f9",
                }}
              >
                <Stack spacing={0.75}>
                  <Chip
                    label={item.type.toUpperCase()}
                    size="small"
                    color={
                      item.type === "warning"
                        ? "warning"
                        : item.type === "success"
                          ? "success"
                          : "info"
                    }
                    sx={{ width: "fit-content", fontWeight: 700 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "normal", color: "#0f172a", lineHeight: 1.5 }}
                  >
                    {item.text}
                  </Typography>
                </Stack>
              </MenuItem>
            ))
          ) : (
            <Box
              sx={{
                px: 2,
                py: 3,
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <NotificationsNone sx={{ mb: 1, color: "#94a3b8" }} />
              <Typography variant="body2">
                No new notifications right now.
              </Typography>
            </Box>
          )}
        </Menu>

        <Menu
          anchorEl={quickActionAnchorEl}
          open={Boolean(quickActionAnchorEl)}
          onClose={() => setQuickActionAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 420,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: 4,
              border: "1px solid #dbeafe",
              boxShadow: "0 24px 60px rgba(37, 99, 235, 0.18)",
              overflow: "hidden",
            },
          }}
        >
          <Box
            sx={{
              px: 2.25,
              py: 2,
              background:
                "linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)",
            }}
          >
            <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
              Quick Actions
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Open common manager and employee tasks from one place.
            </Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Grid container spacing={1.5}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} key={action.label}>
                  <Paper
                    variant="outlined"
                    onClick={() => {
                      setQuickActionAnchorEl(null);
                      navigate(action.path);
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      cursor: "pointer",
                      borderColor: "#e2e8f0",
                      transition: "all .18s ease",
                      "&:hover": {
                        borderColor: "#93c5fd",
                        bgcolor: "#f8fbff",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#eff6ff",
                          color: "#2563eb",
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}
                        >
                          {action.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b" }}
                        >
                          Open now
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Menu>
      </Box>
    </Box>
  );
}
