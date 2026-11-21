import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  ArrowForward,
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  EventAvailable,
  Login,
  Logout,
  NotificationsActive,
  NotificationsNone,
  Payments,
  ReceiptLong,
  WorkOutline,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  getAttendanceByDate,
  getTodayAttendance,
  punchIn,
  punchOut,
} from "../../services/AttendanceService/attendanceService";
import {
  getLeaveBalance,
  getLeaveRequests,
} from "../../services/UserService/userService";
import { getAllAttendanceData as getManagerAttendanceData } from "../../services/ManagerService/attendanceService";
import { getAllUserLeaveRequests } from "../../services/ManagerService/leaveService";
import { getManagerInterviews } from "../../services/JobRecruitmentService/interviewService";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const tokens = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderSoft: "#f1f5f9",
  text: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  subtle: "#94a3b8",
  accent: "#1d4ed8",
  accentSoft: "#eff6ff",
  accentBorder: "#bfdbfe",
  success: "#15803d",
  successSoft: "#f0fdf4",
  successBorder: "#bbf7d0",
  warning: "#b45309",
  warningSoft: "#fffbeb",
  warningBorder: "#fde68a",
  danger: "#b91c1c",
  dangerSoft: "#fef2f2",
  dangerBorder: "#fecaca",
};

const cardSx = {
  borderRadius: 3,
  border: `1px solid ${tokens.border}`,
  bgcolor: tokens.surface,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const padNumber = (value) => String(value).padStart(2, "0");

const formatDateInput = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate(),
  )}`;
};

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

const formatMonthLabel = (value) =>
  value.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

const formatLongDate = (value) =>
  value.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getDisplayName = (user) => {
  const source =
    user?.user && typeof user.user === "object" ? user.user : user;
  if (!source) return "User";

  const fullName = [
    source.firstName || source.first_name,
    source.lastName || source.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    source.name ||
    source.fullName ||
    source.username ||
    (source.email ? toTitleCase(source.email.split("@")[0]) : "") ||
    "User"
  );
};

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const statusStyles = {
  APPROVED: {
    bg: tokens.successSoft,
    color: tokens.success,
    border: tokens.successBorder,
    label: "Approved",
  },
  PENDING: {
    bg: tokens.warningSoft,
    color: tokens.warning,
    border: tokens.warningBorder,
    label: "Pending",
  },
  REJECTED: {
    bg: tokens.dangerSoft,
    color: tokens.danger,
    border: tokens.dangerBorder,
    label: "Rejected",
  },
  ABSENT: {
    bg: tokens.dangerSoft,
    color: tokens.danger,
    border: tokens.dangerBorder,
    label: "No record",
  },
  NEUTRAL: {
    bg: tokens.bg,
    color: tokens.muted,
    border: tokens.border,
    label: "No request",
  },
};

const notificationDot = {
  success: tokens.success,
  warning: "#d97706",
  info: tokens.accent,
};

function StatusPill({ status }) {
  const style = statusStyles[status] || statusStyles.NEUTRAL;

  return (
    <Chip
      size="small"
      label={style.label}
      sx={{
        height: 24,
        fontWeight: 600,
        fontSize: 12,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
      }}
    />
  );
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...cardSx,
        p: { xs: 1.75, sm: 2.5 },
        height: "100%",
        transition: "border-color .2s ease, box-shadow .2s ease",
        "&:hover": {
          borderColor: tokens.accentBorder,
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row-reverse" },
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: { xs: 1.5, sm: 2 },
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: { xs: 34, sm: 40 },
            height: { xs: 34, sm: 40 },
            borderRadius: 2,
            bgcolor: tokens.accentSoft,
            color: tokens.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, width: "100%" }}>
          <Typography
            sx={{
              fontSize: { xs: 12.5, sm: 13 },
              fontWeight: 500,
              color: tokens.muted,
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              lineHeight: 1.15,
              fontWeight: 700,
              color: tokens.text,
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              lineHeight: 1.4,
              color: tokens.subtle,
              mt: 0.75,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { xs: "normal", lg: "nowrap" },
            }}
          >
            {helper}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <Paper
      elevation={0}
      sx={{ ...cardSx, p: { xs: 2, md: 3 }, height: "100%" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 700,
              color: tokens.text,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: tokens.muted, mt: 0.25 }}>
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

function SummaryCounter({ label, value, status }) {
  const style = statusStyles[status];

  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${style.border}`,
        bgcolor: style.bg,
      }}
    >
      <Typography
        sx={{ fontSize: 22, fontWeight: 700, color: style.color, lineHeight: 1 }}
      >
        {value}
      </Typography>
      <Typography
        sx={{ fontSize: 12, fontWeight: 500, color: style.color, mt: 0.5 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function DetailRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ py: 1.25 }}
    >
      <Typography sx={{ fontSize: 13, color: tokens.muted }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>
        {value}
      </Typography>
    </Stack>
  );
}

function LegendItem({ color, border, label }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "3px",
          bgcolor: color,
          border: `1px solid ${border}`,
        }}
      />
      <Typography sx={{ fontSize: 12, color: tokens.muted }}>{label}</Typography>
    </Stack>
  );
}

function MiniCalendar({
  monthDate,
  selectedDate,
  attendanceMap,
  onDateSelect,
  onMonthChange,
}) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography sx={{ fontWeight: 700, color: tokens.text, fontSize: 15 }}>
          {formatMonthLabel(monthDate)}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Previous month">
            <IconButton
              size="small"
              onClick={() => onMonthChange(-1)}
              sx={{ border: `1px solid ${tokens.border}`, borderRadius: 1.5 }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next month">
            <IconButton
              size="small"
              onClick={() => onMonthChange(1)}
              sx={{ border: `1px solid ${tokens.border}`, borderRadius: 1.5 }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.5, sm: 1 },
          mb: 1,
        }}
      >
        {WEEK_DAYS.map((day) => (
          <Typography
            key={day}
            sx={{
              textAlign: "center",
              color: tokens.subtle,
              fontWeight: 600,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {cells.map((day, index) => {
          if (!day) {
            return <Box key={`empty-${index}`} />;
          }

          const cellDate = new Date(year, month, day);
          const isToday =
            day === now.getDate() &&
            month === now.getMonth() &&
            year === now.getFullYear();
          const isFuture = cellDate > todayStart;
          const dateKey = formatDateInput(cellDate);
          const attendance = attendanceMap[dateKey];
          const status = attendance?.requestStatus;
          const isSelected = selectedDate === dateKey;

          let style = statusStyles.ABSENT;
          if (isFuture) {
            style = {
              bg: tokens.surface,
              color: tokens.subtle,
              border: tokens.borderSoft,
            };
          } else if (status && statusStyles[status]) {
            style = statusStyles[status];
          }

          return (
            <Box
              key={day}
              role="button"
              tabIndex={0}
              onClick={() => onDateSelect(dateKey)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDateSelect(dateKey);
                }
              }}
              sx={{
                aspectRatio: "1 / 1",
                width: "100%",
                maxWidth: 44,
                mx: "auto",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: style.bg,
                color: style.color,
                border: isSelected
                  ? `2px solid ${tokens.text}`
                  : isToday
                    ? `2px solid ${tokens.accent}`
                    : `1px solid ${style.border}`,
                fontWeight: isToday || status ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                userSelect: "none",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 3px 8px rgba(15, 23, 42, 0.10)",
                },
                "&:focus-visible": {
                  outline: `2px solid ${tokens.accent}`,
                  outlineOffset: 2,
                },
              }}
            >
              {day}
            </Box>
          );
        })}
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={2}
        sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${tokens.borderSoft}` }}
      >
        <LegendItem
          color={tokens.successSoft}
          border={tokens.successBorder}
          label="Approved"
        />
        <LegendItem
          color={tokens.warningSoft}
          border={tokens.warningBorder}
          label="Pending"
        />
        <LegendItem
          color={tokens.dangerSoft}
          border={tokens.dangerBorder}
          label="Rejected / Absent"
        />
      </Stack>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const today = useMemo(() => new Date(), []);
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
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    formatDateInput(today),
  );
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [quickActionAnchorEl, setQuickActionAnchorEl] = useState(null);
  const isEmployee = user?.role === "employee";
  const isManager = user?.role === "manager";

  const loadCalendarAttendance = async (monthValue, selectedDateValue) => {
    const startDate = new Date(
      monthValue.getFullYear(),
      monthValue.getMonth(),
      1,
    );
    const endDate = new Date(
      monthValue.getFullYear(),
      monthValue.getMonth() + 1,
      0,
    );

    const response = await getAttendanceByDate({
      startDate: formatDateInput(startDate),
      endDate: formatDateInput(endDate),
    });

    if (!response?.success || !Array.isArray(response.data)) {
      setAttendanceRows([]);
      setSelectedAttendance(null);
      return;
    }

    const mappedRows = response.data.map((item) => {
      const request = item.AttendanceRequests?.[0] || null;

      return {
        id: item.id,
        date: item.date,
        punchInAt: item.punchInAt,
        punchOutAt: item.punchOutAt,
        workedMinutes: Number(item.workedMinutes || 0),
        breakMinutes: Number(item.breakMinutes || 0),
        overtimeMinutes: Number(item.overtimeMinutes || 0),
        isLate: Boolean(item.isLate),
        isHalfDay: Boolean(item.isHalfDay),
        isFullDay: Boolean(item.isFullDay),
        requestStatus: request?.status || null,
        requestType: request?.requestType || null,
      };
    });

    setAttendanceRows(mappedRows);

    const exactMatch = mappedRows.find(
      (item) => item.date === selectedDateValue,
    );
    setSelectedAttendance(exactMatch || null);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const requests = [getTodayAttendance()];
      if (isEmployee) {
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

      const [todayRes, firstRes, secondRes, thirdRes] =
        await Promise.all(requests);

      setAttendanceStatus(todayRes?.success ? todayRes.data : null);

      if (isEmployee) {
        setLeaveBalance(firstRes?.success ? firstRes.data || [] : []);
        setLeaveRequests(secondRes?.success ? secondRes.data || [] : []);
        setManagerAttendanceRequests([]);
        setManagerLeaveRequests([]);
        setManagerInterviews([]);
      } else if (isManager) {
        setLeaveBalance([]);
        setLeaveRequests([]);
        setManagerAttendanceRequests(
          firstRes?.success ? firstRes?.data?.data || [] : [],
        );
        setManagerLeaveRequests(secondRes?.success ? secondRes.data || [] : []);
        setManagerInterviews(
          thirdRes?.success ? thirdRes?.data?.rows || [] : [],
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
    if (!user?.id) return;
    loadCalendarAttendance(calendarMonth, selectedCalendarDate);
  }, [user?.id, calendarMonth, selectedCalendarDate]);

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

  const isPunchedIn = Boolean(
    attendanceStatus?.lastInAt && !attendanceStatus?.punchOutAt,
  );

  const handlePunch = async () => {
    const action = isPunchedIn ? punchOut : punchIn;

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
    const attendanceMap = {};
    let workedMinutes = 0;
    let breakMinutes = 0;
    let present = 0;
    let pending = 0;
    let rejected = 0;

    attendanceRows.forEach((item) => {
      attendanceMap[item.date] = item;

      if (item.requestStatus === "APPROVED") {
        present += 1;
      } else if (item.requestStatus === "PENDING") {
        pending += 1;
      } else if (item.requestStatus === "REJECTED") {
        rejected += 1;
      }

      workedMinutes += Number(item.workedMinutes || 0);
      breakMinutes += Number(item.breakMinutes || 0);
    });

    const leaveAvailable = leaveBalance.reduce(
      (sum, item) => sum + Number(item.balance || 0),
      0,
    );

    return {
      attendanceMap,
      workingDays: attendanceRows.length,
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

  const selectedAttendanceInfo = useMemo(() => {
    if (!selectedAttendance) {
      return {
        label: new Date(`${selectedCalendarDate}T00:00:00`).toLocaleDateString(
          [],
          { day: "2-digit", month: "short", year: "numeric" },
        ),
        status: "ABSENT",
        punchIn: "--",
        punchOut: "--",
        worked: "0h 0m",
      };
    }

    return {
      label: new Date(selectedAttendance.date).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: selectedAttendance.requestStatus || "NEUTRAL",
      punchIn: formatTime(selectedAttendance.punchInAt),
      punchOut: formatTime(selectedAttendance.punchOutAt),
      worked: formatMinutes(selectedAttendance.workedMinutes),
    };
  }, [selectedAttendance, selectedCalendarDate]);

  const quickActions = [
    {
      label: "Attendance",
      description: "View your records",
      icon: <AccessTime fontSize="small" />,
      path: isEmployee ? "/user/attendance" : "/manager/attendance/me",
    },
    {
      label: "Leave Management",
      description: "Apply and track leaves",
      icon: <CalendarMonth fontSize="small" />,
      path: isEmployee ? "/user/leave-management" : "/manager/leave/management",
    },
    {
      label: "Expenses",
      description: "Submit and review claims",
      icon: <Payments fontSize="small" />,
      path: isEmployee ? "/user/expense" : "/manager/expenses",
    },
    ...(isManager
      ? [
          {
            label: "Attendance Requests",
            description: "Review team requests",
            icon: <EventAvailable fontSize="small" />,
            path: "/manager/attendance/request",
          },
          {
            label: "Leave Requests",
            description: "Approve or reject leaves",
            icon: <ReceiptLong fontSize="small" />,
            path: "/manager/leave-requests",
          },
          {
            label: "Interviews",
            description: "Upcoming and pending",
            icon: <NotificationsActive fontSize="small" />,
            path: "/manager/interviews",
          },
        ]
      : []),
  ];

  const pendingApprovals = isManager
    ? managerLeaveRequests.filter((item) => item.status === "PENDING").length +
      managerAttendanceRequests.filter((item) => item.status === "PENDING")
        .length
    : leaveRequests.filter((item) => item.status === "PENDING").length;

  const heroStats = [
    {
      label: "Status",
      value: isPunchedIn ? "Punched in" : "Punched out",
      dot: isPunchedIn ? "#4ade80" : "#94a3b8",
    },
    {
      label: isManager ? "Awaiting approval" : "Pending requests",
      value: pendingApprovals,
      dot: pendingApprovals > 0 ? "#fbbf24" : null,
    },
    {
      label: "Notifications",
      value: notifications.length,
      dot: null,
    },
  ];

  const displayName = getDisplayName(user);

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
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: tokens.bg,
        minHeight: "100%",
        p: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 2.5, md: 4 },
            mb: 3,
            borderRadius: 4,
            color: "#fff",
            background:
              "linear-gradient(120deg, #0f2a56 0%, #163a73 55%, #1d4ed8 135%)",
            boxShadow: "0 10px 30px rgba(15, 42, 86, 0.18)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -120,
              right: -80,
              width: 340,
              height: 340,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -150,
              left: "32%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 70%)",
            },
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={{ xs: 3, lg: 4 }}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                mb={1.5}
              >
                <Chip
                  size="small"
                  label={capitalize(user?.role) || "Dashboard"}
                  sx={{
                    height: 24,
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.16)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                />
                <Typography
                  sx={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}
                >
                  {formatLongDate(today)}
                </Typography>
              </Stack>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 26, md: 34 },
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  mb: 1.25,
                }}
              >
                Welcome back, {displayName}
              </Typography>
              <Typography
                sx={{
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.78)",
                  maxWidth: 540,
                }}
              >
                Track attendance, leave balance, working hours, notifications,
                and your next actions from one place.
              </Typography>

              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                spacing={1.5}
                sx={{ mt: 3 }}
              >
                {heroStats.map((stat) => (
                  <Box
                    key={stat.label}
                    sx={{
                      flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                      minWidth: { xs: 0, sm: 128 },
                      px: 1.75,
                      py: 1.25,
                      borderRadius: 2.5,
                      bgcolor: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.68)",
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      {stat.dot && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: stat.dot,
                          }}
                        />
                      )}
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", lg: 380 },
                flexShrink: 0,
                p: 2.5,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.20)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: isPunchedIn ? "#4ade80" : "#94a3b8",
                        boxShadow: isPunchedIn
                          ? "0 0 0 4px rgba(74, 222, 128, 0.22)"
                          : "none",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.78)",
                      }}
                    >
                      Today's working time
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: { xs: 26, md: 32 },
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                      mt: 0.75,
                    }}
                  >
                    {formatSeconds(liveSeconds)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.62)",
                      mt: 0.25,
                    }}
                  >
                    Punched in at {formatTime(attendanceStatus?.lastInAt)}
                  </Typography>
                </Box>

                <Tooltip title="Notifications">
                  <IconButton
                    aria-label="Open notifications"
                    onClick={(event) =>
                      setNotificationAnchorEl(event.currentTarget)
                    }
                    sx={{
                      width: 44,
                      height: 44,
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
                    }}
                  >
                    <Badge
                      badgeContent={notifications.length}
                      color="error"
                      max={99}
                    >
                      <NotificationsActive fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ mt: 2.5 }}
              >
                <Button
                  fullWidth
                  disableElevation
                  variant="contained"
                  onClick={handlePunch}
                  disabled={punchLoading}
                  startIcon={isPunchedIn ? <Logout /> : <Login />}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: 14,
                    bgcolor: isPunchedIn ? "#ef4444" : "#22c55e",
                    "&:hover": {
                      bgcolor: isPunchedIn ? "#dc2626" : "#16a34a",
                    },
                  }}
                >
                  {punchLoading
                    ? "Please wait..."
                    : isPunchedIn
                      ? "Punch Out"
                      : "Punch In"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={(event) =>
                    setQuickActionAnchorEl(event.currentTarget)
                  }
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: 14,
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.32)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      bgcolor: "rgba(255,255,255,0.16)",
                    },
                  }}
                >
                  Quick Actions
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, sm: 2.5 },
            mb: 3,
          }}
        >
          <MetricCard
            icon={<CalendarMonth fontSize="small" />}
            label="Working Days"
            value={summary.workingDays}
            helper="Attendance records this cycle"
          />
          <MetricCard
            icon={<EventAvailable fontSize="small" />}
            label="Present Days"
            value={summary.present}
            helper="Approved attendance entries"
          />
          <MetricCard
            icon={<ReceiptLong fontSize="small" />}
            label="Leave Balance"
            value={summary.leaveAvailable}
            helper="Available leave days"
          />
          <MetricCard
            icon={<AccessTime fontSize="small" />}
            label="Worked Hours"
            value={formatMinutes(summary.workedMinutes)}
            helper={`Break time ${formatMinutes(summary.breakMinutes)}`}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 2fr) minmax(0, 1fr)",
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          <SectionCard
            title="Attendance Overview"
            subtitle="Monthly presence snapshot and approval status"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  md: "minmax(0, 7fr) minmax(0, 5fr)",
                },
                gap: 3,
              }}
            >
              <MiniCalendar
                monthDate={calendarMonth}
                selectedDate={selectedCalendarDate}
                attendanceMap={summary.attendanceMap}
                onDateSelect={setSelectedCalendarDate}
                onMonthChange={(step) => {
                  const nextMonth = new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + step,
                    1,
                  );
                  setCalendarMonth(nextMonth);
                  setSelectedCalendarDate(formatDateInput(nextMonth));
                }}
              />

              <Box>
                <Stack direction="row" spacing={1.25} sx={{ mb: 2.5 }}>
                  <SummaryCounter
                    label="Approved"
                    value={summary.present}
                    status="APPROVED"
                  />
                  <SummaryCounter
                    label="Pending"
                    value={summary.pending}
                    status="PENDING"
                  />
                  <SummaryCounter
                    label="Rejected"
                    value={summary.rejected}
                    status="REJECTED"
                  />
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${tokens.border}`,
                    bgcolor: tokens.bg,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: tokens.text,
                      }}
                    >
                      {selectedAttendanceInfo.label}
                    </Typography>
                    <StatusPill status={selectedAttendanceInfo.status} />
                  </Stack>
                  <Divider sx={{ borderColor: tokens.border }} />
                  <DetailRow
                    label="Punch in"
                    value={selectedAttendanceInfo.punchIn}
                  />
                  <Divider sx={{ borderColor: tokens.borderSoft }} />
                  <DetailRow
                    label="Punch out"
                    value={selectedAttendanceInfo.punchOut}
                  />
                  <Divider sx={{ borderColor: tokens.borderSoft }} />
                  <DetailRow
                    label="Worked"
                    value={selectedAttendanceInfo.worked}
                  />
                </Box>
              </Box>
            </Box>
          </SectionCard>

          <SectionCard
            title="Current Project"
            subtitle="Assignment and workload status"
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: tokens.bg,
                border: `1px dashed ${tokens.border}`,
                minHeight: { xs: 180, lg: 260 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  mb: 1.5,
                  bgcolor: tokens.accentSoft,
                  color: tokens.accent,
                }}
              >
                <WorkOutline />
              </Avatar>
              <Typography
                sx={{ fontWeight: 700, color: tokens.text, fontSize: 15 }}
              >
                Project not assigned
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: tokens.muted,
                  mt: 0.5,
                  maxWidth: 260,
                  lineHeight: 1.55,
                }}
              >
                Update this card once project mapping is available from the
                backend.
              </Typography>
              <Chip
                label="Awaiting allocation"
                size="small"
                sx={{
                  mt: 2,
                  height: 24,
                  fontWeight: 600,
                  fontSize: 12,
                  color: tokens.warning,
                  bgcolor: tokens.warningSoft,
                  border: `1px solid ${tokens.warningBorder}`,
                }}
              />
            </Box>
          </SectionCard>
        </Box>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={() => setNotificationAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          MenuListProps={{ disablePadding: true }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 380,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: 3,
              border: `1px solid ${tokens.border}`,
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.75, bgcolor: tokens.bg }}>
            <Typography
              sx={{ fontWeight: 700, color: tokens.text, fontSize: 15 }}
            >
              Notifications
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.muted }}>
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
                  py: 1.5,
                  px: 2,
                  alignItems: "flex-start",
                  whiteSpace: "normal",
                  borderBottom:
                    index === notifications.length - 1
                      ? "none"
                      : `1px solid ${tokens.borderSoft}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      mt: 0.75,
                      borderRadius: "50%",
                      flexShrink: 0,
                      bgcolor: notificationDot[item.type] || tokens.accent,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      whiteSpace: "normal",
                      color: tokens.body,
                      lineHeight: 1.5,
                    }}
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
                py: 4,
                textAlign: "center",
                color: tokens.muted,
              }}
            >
              <NotificationsNone sx={{ mb: 1, color: tokens.subtle }} />
              <Typography sx={{ fontSize: 13 }}>
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
          MenuListProps={{ disablePadding: true }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 400,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: 3,
              border: `1px solid ${tokens.border}`,
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.75, bgcolor: tokens.bg }}>
            <Typography
              sx={{ fontWeight: 700, color: tokens.text, fontSize: 15 }}
            >
              Quick Actions
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: tokens.muted }}>
              Jump to the tasks you use most.
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 1 }}>
            {quickActions.map((action) => (
              <MenuItem
                key={action.label}
                onClick={() => {
                  setQuickActionAnchorEl(null);
                  navigate(action.path);
                }}
                sx={{ borderRadius: 2, py: 1.25, px: 1.25 }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: tokens.accentSoft,
                      color: tokens.accent,
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: tokens.text,
                        lineHeight: 1.25,
                      }}
                    >
                      {action.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: tokens.muted }}>
                      {action.description}
                    </Typography>
                  </Box>
                  <ChevronRight fontSize="small" sx={{ color: tokens.subtle }} />
                </Stack>
              </MenuItem>
            ))}
          </Box>
        </Menu>
      </Box>
    </Box>
  );
}