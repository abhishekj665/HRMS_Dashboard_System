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

import { Rating, Divider, Paper } from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";

import { RateReview, Star, ThumbUp } from "@mui/icons-material";

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
} from "../../../services/JobRecruitmentService/interviewService";

import { submitInterviewFeedback } from "../../../services/JobRecruitmentService/interviewFeedbackService";

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

  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [feedbackDialog, setFeedbackDialog] = useState(null);

  const [feedback, setFeedback] = useState({
    technicalScore: 3,
    communicationScore: 3,
    problemSolvingScore: 3,
    recommendation: "HOLD",
    strength: "",
    weakness: "",
    remark: "",
  });

  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

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

  const submitFeedback = async () => {
    try {
      setFeedbackSubmitting(true);

      const response = await submitInterviewFeedback(
        feedbackDialog.interviewId,
        feedback,
      );

      if (response.success) {
        toast.success("Feedback submitted successfully");
        setFeedbackDialog(null);
        fetchInterviews();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFeedbackSubmitting(false);
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

        if (response.success) {
          toast.success(response.message);
          fetchInterviews();
        } else {
          toast.error(response.message);
        }
      }

      if (actionDialog.type === "DECLINE") {
        if (!remark) return toast.error("Remark is required");
        const response = await declineInterview(actionDialog.id, remark);
        if (response.success) {
          toast.success(response.message);
          fetchInterviews();
        } else {
          toast.error(response.message);
        }
      }

      if (actionDialog.type === "RESCHEDULE") {
        if (!remark) return toast.error("Remark is required");
        if (!proposedDate || !proposedTime)
          return toast.error("Please select proposed date and time");

        setSubmitting(true);

        const proposedScheduledAt = dayjs(
          `${proposedDate} ${proposedTime}`,
          "YYYY-MM-DD HH:mm",
        ).toISOString();

        const response = await requestReschedule(actionDialog.id, {
          remark,
          proposedScheduledAt,
        });

        if (response.success) {
          toast.success(response.message);
          fetchInterviews();
        } else {
          toast.error(response.message);
        }
      }

      setSubmitting(false);
      setActionDialog(null);
      setRemark("");
      setProposedDate("");
      setProposedTime("");
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
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="DECLINED">Declined</MenuItem>
                  <MenuItem value="RESCHEDULED">Reschedule</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
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

                        {["SCHEDULED", "RESCHEDULED"].includes(row.status) &&
                          row.mode === "ONLINE" &&
                          row.meetingUrl && (
                            <Tooltip title="Join Interview">
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
                        {["SCHEDULED", "RESCHEDULED"].includes(row.status) &&
                          row.mode === "OFFLINE" &&
                          row.location && (
                            <Tooltip title={row.location}>
                              <IconButton color="info">
                                <Event />
                              </IconButton>
                            </Tooltip>
                          )}
                        {["SCHEDULED", "RESCHEDULED"].includes(row.status) &&
                          !row.feedbackSubmitted && (
                            <Tooltip title="Submit Feedback">
                              <IconButton
                                color="secondary"
                                onClick={() =>
                                  setFeedbackDialog({
                                    interviewId: row.id,
                                  })
                                }
                              >
                                <RateReview />
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
          {actionDialog?.type === "CONFIRM" && (
            <Typography sx={{ mt: 1 }}>
              Are you sure you want to confirm this interview?
            </Typography>
          )}

          {actionDialog?.type === "DECLINE" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              sx={{ mt: 1 }}
              required
            />
          )}

          {actionDialog?.type === "RESCHEDULE" && (
            <Stack spacing={2} mt={1}>
              <TextField
                type="date"
                label="Proposed Date"
                InputLabelProps={{ shrink: true }}
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                fullWidth
                required
              />

              <TextField
                type="time"
                label="Proposed Time"
                InputLabelProps={{ shrink: true }}
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                fullWidth
                required
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                required
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAction}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!feedbackDialog}
        onClose={() => setFeedbackDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <RateReview color="primary" />
            <Typography fontWeight={600}>Interview Evaluation</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} mt={1}>
            {/* Technical Skills */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PsychologyIcon color="primary" />
                  <Typography fontWeight={500}>Technical Skills</Typography>
                </Stack>

                <Rating
                  value={feedback.technicalScore}
                  onChange={(e, newValue) =>
                    setFeedback({
                      ...feedback,
                      technicalScore: newValue,
                    })
                  }
                />
              </Stack>
            </Paper>

            {/* Communication */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <RecordVoiceOverIcon color="primary" />
                  <Typography fontWeight={500}>Communication</Typography>
                </Stack>

                <Rating
                  value={feedback.communicationScore}
                  onChange={(e, newValue) =>
                    setFeedback({
                      ...feedback,
                      communicationScore: newValue,
                    })
                  }
                />
              </Stack>
            </Paper>

            {/* Problem Solving */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LightbulbIcon color="primary" />
                  <Typography fontWeight={500}>Problem Solving</Typography>
                </Stack>

                <Rating
                  value={feedback.problemSolvingScore}
                  onChange={(e, newValue) =>
                    setFeedback({
                      ...feedback,
                      problemSolvingScore: newValue,
                    })
                  }
                />
              </Stack>
            </Paper>

            <Divider />

            {/* Recommendation */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ThumbUpAltIcon color="primary" />
                <Typography fontWeight={500}>Recommendation</Typography>
              </Stack>

              <Select
                fullWidth
                value={feedback.recommendation}
                onChange={(e) =>
                  setFeedback({
                    ...feedback,
                    recommendation: e.target.value,
                  })
                }
              >
                <MenuItem value="HIRE">Hire</MenuItem>
                <MenuItem value="HOLD">Hold</MenuItem>
                <MenuItem value="REJECT">Reject</MenuItem>
              </Select>
            </Stack>

            {/* Strengths */}
            <TextField
              label="Candidate Strengths"
              multiline
              rows={3}
              fullWidth
              value={feedback.strength}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  strength: e.target.value,
                })
              }
            />

            {/* Weakness */}
            <TextField
              label="Areas for Improvement"
              multiline
              rows={3}
              fullWidth
              value={feedback.weakness}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  weakness: e.target.value,
                })
              }
            />

            {/* Remarks */}
            <TextField
              label="Additional Notes"
              multiline
              rows={3}
              fullWidth
              value={feedback.remark}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  remark: e.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFeedbackDialog(null)}>Cancel</Button>

          <Button
            variant="contained"
            disabled={feedbackSubmitting}
            onClick={submitFeedback}
          >
            {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
