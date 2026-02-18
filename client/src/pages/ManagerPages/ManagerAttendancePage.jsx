import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Tabs,
  Tab,
  Button,
  Pagination,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { getAttendanceData } from "../../services/ManagerService/attendanceService";

const statusColor = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export default function ManagerAttendancePage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const fmtTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const fmtMinutesToHM = (mins) => {
    if (!mins || mins <= 0) return "0h 0m";

    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "-");

  const fetchAttendanceData = async () => {
    try {
      const params = { page, limit };
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await getAttendanceData(params);

      console.log("API:", res);

      const payload = res?.data;

      if (!res?.success || !payload || !Array.isArray(payload.data)) {
        setRows([]);
        setTotal(0);
        return;
      }

      setTotal(payload.total || 0);

      const mapped = payload.data.map((item) => {
        const a = item.Attendance || {};

        return {
          id: item.id,
          requestDate: fmtDate(item.createdAt),
          punchIn: fmtTime(a.punchInAt),
          punchOut: fmtTime(a.punchOutAt),

          worked: fmtMinutesToHM(a.workedMinutes),
          break: fmtMinutesToHM(a.breakMinutes),
          overtime: fmtMinutesToHM(a.overtimeMinutes),

          status: item.status.toLowerCase(),
          reviewedByEmail: item.approver?.email?.split("@")[0] || "-",
        };
      });

      setRows(mapped);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotal(0);
    }
  };

  const fetchRequestData = async () => {
    try {
      const params = {
        page,
        limit,
        status: "PENDING",
      };

      console.log(params);

      const res = await getAttendanceData(params);

      const payload = res?.data;

      if (!res?.success || !payload || !Array.isArray(payload.data)) {
        setRows([]);
        setTotal(0);
        return;
      }

      setTotal(payload.total || 0);

      const mapped = payload.data.map((item) => {
        const a = item.Attendance || {};

        return {
          id: item.id,
          requestDate: fmtDate(item.createdAt),
          punchIn: fmtTime(a.punchInAt),
          punchOut: fmtTime(a.punchOutAt),
          worked: fmtMinutesToHM(a.workedMinutes),
          break: fmtMinutesToHM(a.breakMinutes),
          overtime: fmtMinutesToHM(a.overtimeMinutes),
          status: item.status.toLowerCase(),
          reviewedByEmail: item.approver?.email?.split("@")[0] || "-",
        };
      });

      setRows(mapped);
    } catch {
      setRows([]);
      setTotal(0);
    }
  };

  const handleSwitch = (e, v) => {
    setTab(v);
    setPage(1);

    if (v === 0) {
      fetchAttendanceData();
    } else if (v === 1) {
      fetchRequestData();
    }
  };

  useEffect(() => {
    if (tab === 0) {
      fetchAttendanceData();
    } else {
      fetchRequestData();
    }
  }, [statusFilter, roleFilter, page, limit, tab]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, roleFilter, limit]);

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === "approved").length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;

    const totalWorked = rows.reduce((a, r) => a + r.worked, 0);
    const totalBreak = rows.reduce((a, r) => a + r.break, 0);

    const uniqueDays = new Set(rows.map((r) => r.requestDate));

    return {
      workingDays: uniqueDays.size,
      present,
      pending,
      rejected,
      workedHrs: Math.floor(totalWorked / 60),
      breakHrs: Math.floor(totalBreak / 60),
    };
  }, [rows]);

  return (
    <Box className="p-3 bg-white">
      <h1 className="text-xl font-bold mb-8 text-gray-800">
        <div className="text-2xl font-medium flex italic tracking-tight">
          <p>Attendance Data</p>
        </div>
      </h1>
      <Card className="rounded-2xl shadow-sm mb-6">
        <CardContent>
          <Box className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Box className="text-center">
              <Typography variant="body2">Working Days</Typography>
              <Typography variant="h6">{summary.workingDays}</Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2">Approved</Typography>
              <Typography variant="h6">{summary.present}</Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2">Pending</Typography>
              <Typography variant="h6">{summary.pending}</Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2">Rejected</Typography>
              <Typography variant="h6">{summary.rejected}</Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2">Worked Hours</Typography>
              <Typography variant="h6">
                {summary.workedHrs ? summary.workedHrs : 0}
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="body2">Break Hours</Typography>
              <Typography variant="h6">
                {summary.breakHrs ? summary.breakHrs : 0}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent>
          <Tabs value={tab} onChange={handleSwitch}>
            <Tab label="Attendance" />
            <Tab label="Regularizations Requests" />
          </Tabs>

          <Box className="flex gap-4 justify-end my-4">
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Rows</InputLabel>
              <Select
                value={limit}
                label="Rows"
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer style={{ backgroundColor: "#F5F5F5" }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Worked</TableCell>
                  <TableCell>Break</TableCell>
                  <TableCell>OverTime</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reviewed By</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.requestDate}</TableCell>
                    <TableCell>{r.punchIn}</TableCell>
                    <TableCell>{r.punchOut}</TableCell>
                    <TableCell>{r.worked ? r.worked : "-"}</TableCell>
                    <TableCell>{r.break ? r.break : "-"}</TableCell>
                    <TableCell>{r.overtime ? r.overtime : "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.status.toUpperCase()}
                        color={statusColor[r.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{r.reviewedByEmail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="flex justify-end mt-4">
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={(e, v) => setPage(v)}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
