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
  Grid,
  Tabs,
  Tab,
  Button,
} from "@mui/material";

import { Pagination } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

import { useEffect, useMemo, useState } from "react";
import {
  getAllAttendanceData,
  approveAttendance,
  rejectAttendance,
  bulkApproveAttendance,
  bulkRejectAttendance,
} from "../../services/AdminService/attendanceService";
import { toast } from "react-toastify";

const statusColor = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export default function AttendanceTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [rejectMode, setRejectMode] = useState("single");

  const [openRejectBox, setOpenRejectBox] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [remark, setRemark] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);

  const [total, setTotal] = useState(0);

  const fmtTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "-");

  const fetchAttendanceData = async () => {
    try {
      const params = { page, limit };

      if (tab === 1) {
        params.status = "pending";
        params.role = "manager";
      } else {
        if (statusFilter !== "all") params.status = statusFilter;
        if (roleFilter !== "all") params.role = roleFilter;
        params.excludeManagerPending = true;
      }

      const res = await getAllAttendanceData(params);

      if (!res?.success || !res?.data) {
        setRows([]);
        setTotal(0);
        return;
      }

      const payload = res.data;
      setTotal(payload.total || 0);

      const mapped = payload.rows.map((item) => {
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
          reviewedByEmail: item.approver?.email
            ? item.approver.email.split("@")[0]
            : null,
          requestDate: fmtDate(item.createdAt),
        };
      });

      setRows(mapped);
    } catch {
      setRows([]);
      setTotal(0);
    }
  };

  const params = { page, limit };

  if (tab === 1) {
    params.role = "manager";
    params.status = "pending";
  } else {
    if (statusFilter !== "all") params.status = statusFilter;
    if (roleFilter !== "all") params.role = roleFilter;
  }

  const visibleRows = useMemo(() => {
    if (tab === 1) {
      return rows.filter((r) => r.status === "pending");
    }

    return rows.filter((r) => r.status !== "pending");
  }, [rows, tab]);

  const toggleAll = () => {
    const allIds = pagedRows.map((r) => r.id);

    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

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
  }, [visibleRows]);

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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

  const handleReject = async (id, remark) => {
    try {
      const response = await rejectAttendance(id, remark);

      if (response?.success) {
        toast.success(response.message || "Rejected");
        fetchAttendanceData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkApprove = async () => {
    const res = await bulkApproveAttendance(selectedIds);

    if (res?.success) {
      toast.success(res.message);
      setSelectedIds([]);
      fetchAttendanceData();
    } else {
      toast.error(res.message);
    }
  };
  const handleBulkReject = async () => {
    const res = await bulkRejectAttendance(selectedIds, remark);

    if (res?.success) {
      toast.success(res.message);
      setSelectedIds([]);
      fetchAttendanceData();
    } else {
      toast.error(res.message);
    }
  };

  const pagedRows = useMemo(() => {
    const start = (page - 1) * limit;
    return visibleRows.slice(start, start + limit);
  }, [visibleRows, page, limit]);

  useEffect(() => {
    fetchAttendanceData();
  }, [statusFilter, roleFilter, page, limit, tab]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, roleFilter]);

  useEffect(() => {
    setSelectedIds([]);
  }, [rows]);

  useEffect(() => {
    setSelectedIds([]);
  }, [tab]);

  return (
    <Box className="p-6 bg-white">
      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold mb-8 text-gray-800">
          <div className="text-2xl font-medium flex italic tracking-tight">
            <p>Attendance Data</p>
          </div>
        </h1>
      </Box>

      {/* Summary Cards */}
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

      {/* Main Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent>
          {/* Tabs */}
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="Attendance" />
            <Tab label="Regularization Requests" />
          </Tabs>

          {/* Filters */}
          <Box className="flex gap-4 justify-end my-4">
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

            {tab == 0 ? (
              <FormControl size="small" className="min-w-40">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  {tab == 0 ? <MenuItem value="user">User</MenuItem> : ""}
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            ) : (
              ""
            )}
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
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer
            style={{ backgroundColor: "#F5F5F5" }}
            ove
            component={Paper}
            className="rounded-xl"
          >
            {tab === 1 && selectedIds.length > 0 && (
              <Box className="flex gap-3 mb-3">
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleBulkApprove}
                >
                  Approve Selected ({selectedIds.length})
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setRejectMode("bulk");
                    setOpenRejectBox(true);
                  }}
                >
                  Reject Selected
                </Button>
              </Box>
            )}

            <Table>
              <TableHead className="bg-slate-50">
                <TableRow>
                  {tab === 1 && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          pagedRows.length > 0 &&
                          pagedRows.every((r) => selectedIds.includes(r.id))
                        }
                        indeterminate={
                          pagedRows.some((r) => selectedIds.includes(r.id)) &&
                          !pagedRows.every((r) => selectedIds.includes(r.id))
                        }
                        onChange={toggleAll}
                      />
                    </TableCell>
                  )}

                  <TableCell>Date</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Worked (m)</TableCell>
                  <TableCell>Break (m)</TableCell>
                  <TableCell>Overtime (m)</TableCell>
                  <TableCell>Status</TableCell>
                  {tab === 0 && <TableCell>Reviewed By</TableCell>}
                  {tab === 1 && <TableCell align="center">Action</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {pagedRows.map((row) => (
                  <TableRow key={row.id} hover>
                    {tab === 1 && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                        />
                      </TableCell>
                    )}

                    <TableCell>{row.requestDate}</TableCell>

                    <TableCell>
                      {row.email.split("@")[0].toUpperCase()}
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

                    {tab === 0 && (
                      <TableCell>
                        {row.reviewedByEmail !== "admin"
                          ? row?.reviewedByEmail?.toUpperCase()
                          : "YOU"}
                      </TableCell>
                    )}

                    {tab === 1 && (
                      <TableCell align="center">
                        {row.role === "manager" && row.status === "pending" && (
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
                              onClick={() => {
                                setRejectMode("single");
                                setRejectId(row.id);
                                setOpenRejectBox(true);
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="flex justify-end mt-4">
            <Pagination
              count={Math.max(1, Math.ceil(visibleRows.length / limit))}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {openRejectBox && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              Reject Attendance Request
            </h2>

            <textarea
              className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-400"
              rows="4"
              placeholder="Enter reject reason..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => {
                  setOpenRejectBox(false);
                  setRemark("");
                  setRejectId(null);
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={async () => {
                  if (!remark.trim()) {
                    toast.error("Reject reason required");
                    return;
                  }

                  if (rejectMode === "bulk") {
                    await handleBulkReject();
                  } else {
                    await handleReject(rejectId, remark);
                  }

                  setOpenRejectBox(false);
                  setRemark("");
                  setRejectId(null);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
