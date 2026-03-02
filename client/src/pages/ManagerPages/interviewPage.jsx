import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  CheckCircle,
  Cancel,
  Update,
  Search,
  RestartAlt,
  Event,
} from "@mui/icons-material";

import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import {
  getManagerInterviews,
  confirmInterview,
  declineInterview,
  requestReschedule,
} from "../../services/CareersService/interviewService";

export default function ManagerInterviewsPage() {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [actionDialog, setActionDialog] = useState(null);
  const [remark, setRemark] = useState("");

  const isInvalidDateRange =
    fromDate && toDate && dayjs(toDate).isBefore(dayjs(fromDate));

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      const res = await getManagerInterviews({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter,
        fromDate,
        toDate,
      });

      if (!res?.success) {
        setRows([]);
        setTotalRows(0);
        return;
      }

      setRows(res.data.rows);
      setTotalRows(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [page, rowsPerPage, statusFilter, fromDate, toDate]);

  const handleAction = async () => {
    if (!actionDialog) return;

    try {
      if (actionDialog.type === "CONFIRM") {
        const response = await confirmInterview(actionDialog.id);
        console.log(response);
        if (response.success) {
          toast.success("Interview confirmed");
          fetchInterviews();
        } else {
          toast.error("Interview confirmation failed");
        }
      }

      if (actionDialog.type === "DECLINE") {
        if (!remark) return toast.error("Remark is required");
        await declineInterview(actionDialog.id, { remark });
        toast.success("Interview declined");
      }

      if (actionDialog.type === "RESCHEDULE") {
        if (!remark) return toast.error("Remark is required");
        await requestReschedule(actionDialog.id, { remark });
        toast.success("Reschedule request sent");
      }

      setActionDialog(null);
      setRemark("");
      fetchInterviews();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return "warning";
      case "CONFIRMED":
        return "success";
      case "DECLINED":
        return "error";
      case "RESCHEDULE_REQUESTED":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth={false} sx={{ marginTop: "10px" }}>
      <Card>
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Event color="primary" />
            <Typography variant="h5" fontWeight={600}>
              My Assigned Interviews
            </Typography>
          </Stack>

          {/* Filters */}
          {/* Filters */}
          <Box mb={3}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} sm={6} md={3}>
                {/* <TextField
                  fullWidth
                  size="small"
                  placeholder="Search candidate or job"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                /> */}
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6} md={2}>
                <Select
                  fullWidth
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="PENDING_CONFIRMATION">Pending</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="DECLINED">Declined</MenuItem>
                  <MenuItem value="RESCHEDULE_REQUESTED">Reschedule</MenuItem>
                </Select>
              </Grid>

              {/* From Date */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Grid>

              {/* To Date */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={toDate}
                  error={isInvalidDateRange}
                  helperText={
                    isInvalidDateRange
                      ? "To date cannot be before From date"
                      : ""
                  }
                  inputProps={{
                    min: fromDate || undefined,
                  }}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Grid>

              {/* Reset */}
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  startIcon={<RestartAlt />}
                  onClick={() => {
                    setStatusFilter("");
                    setSearch("");
                    setFromDate("");
                    setToDate("");
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell>Round</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => {
                  const date = dayjs(row.scheduledAt).format("DD MMM YYYY");
                  const time = dayjs(row.scheduledAt).format("hh:mm A");

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {row.application?.candidate?.firstName}
                      </TableCell>
                      <TableCell>
                        {row.application?.jobPosting?.title}
                      </TableCell>
                      <TableCell>
                        <Stack direction="column" spacing={0.5}>
                          <Chip
                            label={row.roundName}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {row.duration} mins
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{date}</TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell>{row.mode}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status.split("_").join(" ")}
                          color={getStatusColor(row.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {/* Pending Actions */}
                        {row.status === "PENDING_CONFIRMATION" && (
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="Accept">
                              <IconButton
                                color="success"
                                onClick={() =>
                                  setActionDialog({
                                    id: row.id,
                                    type: "CONFIRM",
                                  })
                                }
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setActionDialog({
                                    id: row.id,
                                    type: "DECLINE",
                                  })
                                }
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Request Reschedule">
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  setActionDialog({
                                    id: row.id,
                                    type: "RESCHEDULE",
                                  })
                                }
                              >
                                <Update />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}

                        {/* Confirmed → Show Join Icon */}
                        {row.status === "CONFIRMED" &&
                          row.mode === "ONLINE" &&
                          row.meetingUrl && (
                            <Tooltip title="Join Meeting">
                              <label>Join Interview</label>
                              <IconButton
                                color="primary"
                                href={row.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Event />
                              </IconButton>
                            </Tooltip>
                          )}

                        {/* Offline Confirmed → Show Location Icon */}
                        {row.status === "CONFIRMED" &&
                          row.mode === "OFFLINE" &&
                          row.location && (
                            <Tooltip title={row.location}>
                              <IconButton color="info">
                                <Event />
                              </IconButton>
                            </Tooltip>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={totalRows}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={!!actionDialog}
        onClose={() => setActionDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog?.type === "CONFIRM" && "Confirm Interview"}
          {actionDialog?.type === "DECLINE" && "Reject Interview"}
          {actionDialog?.type === "RESCHEDULE" && "Request Reschedule"}
        </DialogTitle>

        <DialogContent>
          {actionDialog?.type !== "CONFIRM" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}

          {actionDialog?.type === "CONFIRM" && (
            <Typography sx={{ mt: 1 }}>
              Are you sure you want to confirm this interview?
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAction}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
