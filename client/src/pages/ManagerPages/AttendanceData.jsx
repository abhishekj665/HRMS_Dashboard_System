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
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAllAttendanceData,
  rejectAttendance,
} from "../../services/managerService";
import { toast } from "react-toastify";
import { approveAttendance } from "../../services/managerService";
import { Pagination } from "@mui/material";

const statusColor = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export default function AttendanceData() {
  const currentUser = useSelector((state) => state.auth.user);

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
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "-");

  useEffect(() => {
    fetchAttendanceData();
  }, [roleFilter, statusFilter, page, limit]);

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

  const fetchAttendanceData = async () => {
    try {
      const params = { page, limit };

      if (statusFilter !== "all") params.status = statusFilter;
      if (roleFilter === "user") params.role = "user";
      if (roleFilter === "me") params.requestedTo = currentUser?.id;

      const res = await getAllAttendanceData(params);

      if (!res?.success || !res?.data) {
        setRows([]);
        setTotal(0);
        return;
      }

      const payload = res.data;

      setTotal(payload.total || 0);

      const mapped = payload.data.map((item) => {
        const a = item.Attendance || {};
        const u = item.requester || {};

        return {
          id: item.id,
          email: u.email || "-",
          role: (u.role || "user").toLowerCase(),
          punchIn: fmtTime(a.punchInAt),
          punchOut: fmtTime(a.punchOutAt),
          worked: a.workedMinutes || 0,
          break: a.breakMinutes || 0,
          overtime: a.overtimeMinutes || 0,
          status: (item.status || "pending").toLowerCase(),
          reviewedBy: item.reviewedBy,
          requestDate: fmtDate(item.createdAt),
        };
      });

      setRows(mapped);
    } catch {
      setRows([]);
      setTotal(0);
    }
  };

  const handleApprove = async (row) => {
    try {
      const response = await approveAttendance(row.id);
      if (response?.success) {
        toast.success(response.message);
        fetchAttendanceData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (row) => {
    try {
      const response = await rejectAttendance(row.id);
      if (response?.success) {
        toast.success(response.message);
        fetchAttendanceData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box className="p-6 bg-white">
      <Box className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold mb-8 text-gray-800">
          <div className="text-2xl font-medium flex italic tracking-tight">
            <p>Attendance Data</p>
          </div>
        </h1>
      </Box>

      <Card className="rounded-2xl shadow-sm mb-6">
        <CardContent>
          <Box className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Working Days
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {summary.workingDays}
              </Typography>
            </Box>

            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {summary.present}
              </Typography>
            </Box>

            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {summary.pending}
              </Typography>
            </Box>

            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {summary.rejected}
              </Typography>
            </Box>

            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Worked Hours
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                className="text-green-600"
              >
                {summary.workedHrs}h
              </Typography>
            </Box>

            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Break Hours
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                className="text-orange-500"
              >
                {summary.breakHrs}h
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="Attendance" />
            <Tab label="Regularization Request" />
          </Tabs>

          <Box className="flex gap-4 justify-end my-4 flex-wrap">
            <FormControl size="small" className="min-w-40">
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
            <FormControl size="small" className="min-w-32">
              <InputLabel>Rows</InputLabel>
              <Select
                value={limit}
                label="Rows"
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} className="rounded-xl">
            <Table>
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Email</TableCell>

                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Worked (m)</TableCell>
                  <TableCell>Break (m)</TableCell>
                  <TableCell>Overtime (m)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reviewed</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.requestDate}</TableCell>

                    <TableCell>
                      <Chip
                        label={row.email.split("@")[0].toUpperCase()}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>{row.punchIn}</TableCell>
                    <TableCell>{row.punchOut}</TableCell>
                    <TableCell>{row.worked}</TableCell>
                    <TableCell>{row.break}</TableCell>
                    <TableCell>{row.overtime}</TableCell>

                    <TableCell>
                      <Chip
                        label={row.status.toUpperCase()}
                        color={statusColor[row.status]}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {row.reviewedBy
                        ? row.reviewedBy === currentUser?.id
                          ? "You"
                          : row.reviewedBy
                        : "—"}
                    </TableCell>

                    <TableCell align="center">
                      {currentUser?.role === "manager" &&
                      row.role === "user" &&
                      row.status === "pending" ? (
                        <Box className="flex gap-2 justify-center">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApprove(row)}
                          >
                            Accept
                          </Button>

                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleReject(row)}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box className="flex justify-end mt-4">
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
