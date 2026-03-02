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
  Drawer,
  Typography,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  duration,
} from "@mui/material";

import { TablePagination } from "@mui/material";

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
} from "@mui/material";

import { Autocomplete } from "@mui/material";

import {
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Cancel,
  Event,
  Close,
  RestartAlt,
} from "@mui/icons-material";

import {
  Email,
  Phone,
  LinkedIn,
  Language,
  LocationOn,
  Business,
  WorkHistory,
  CurrencyRupee,
  Schedule,
  Public,
} from "@mui/icons-material";

import Grid from "@mui/material/Grid";

import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  shortlistApplication,
  rejectApplication,
} from "../../services/CareersService/appllicationService";
import { useNavigate } from "react-router-dom";

import { getApplications } from "../../services/CareersService/appllicationService";
import { getAllJobPosts } from "../../services/CareersService/jobPostService";
import { getApplicationById } from "../../services/CareersService/appllicationService";
import { toast } from "react-toastify";

import {
  getInterviewers,
  assignInterview,
} from "../../services/CareersService/interviewService";

export default function AdminApplicationsPage() {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(undefined);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedApplication, setSelectedApplication] = useState(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await getApplications({
        page: page + 1,
        limit: rowsPerPage,
        jobId: selectedJob?.id,
        search,
        stageId: stageFilter,
        status: statusFilter,
      });

      if (!res?.success) {
        setRows([]);
        setTotalRows(0);
        return;
      }

      const pagination = res.data;

      const formattedRows = pagination.rows.map((item) => ({
        id: item.id,
        candidateName: `${item.candidate?.firstName || ""} ${item.candidate?.lastName || ""}`,
        email: item.candidate?.email || "N/A",
        contact: item.candidate?.contact || "N/A",
        jobSlug: item.jobPosting?.slug || "N/A",
        jobTitle: item.jobPosting?.title || "N/A",
        stage: item.currentStage?.name || "N/A",
        status: item.status,
        appliedAt: item.appliedAt,
      }));

      setRows(formattedRows);
      setTotalRows(pagination.total);
    } catch (error) {
      console.error(error);
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id) => {
    try {
      setDetailOpen(true);
      setSelectedApplication(null);

      const response = await getApplicationById(id);

      if (!response?.data) {
        toast.error("Invalid application data");
        return;
      }

      setSelectedApplication(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, rowsPerPage, search, stageFilter, statusFilter, selectedJob]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await getAllJobPosts();

      if (res?.success) {
        setJobs(res.data);
      }
    };

    fetchJobs();
  }, [selectedApplication]);

  const columns = [
    {
      field: "candidateName",
      headerName: "Candidate",
      flex: 1,
    },
    {
      field: "jobSlug",
      headerName: "Job Slug",
      flex: 1,
    },
    {
      field: "stage",
      headerName: "Stage",
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value} color="info" size="small" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "REJECTED"
              ? "error"
              : params.value === "SHORTLISTED"
                ? "success"
                : "default"
          }
          size="small"
        />
      ),
    },
    {
      field: "appliedAt",
      headerName: "Applied",
      flex: 1,
      renderCell: (params) => dayjs(params.value).format("DD MMM YYYY"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View">
            <IconButton onClick={() => handleAction(params.row.id)}>
              <Visibility />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth={false} disableGutters>
      <Card>
        <CardContent>
          {/* FILTER BAR */}
          <Stack direction="row" spacing={2} mb={3} alignItems="center">
            <Autocomplete
              size="small"
              options={jobs}
              value={selectedJob}
              onChange={(event, newValue) => {
                setSelectedJob(newValue);
              }}
              getOptionLabel={(option) => option?.title || ""}
              renderInput={(params) => (
                <TextField {...params} label="Select Job" />
              )}
              sx={{ minWidth: 250 }}
            />

            <Select
              size="small"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Stages</MenuItem>
              <MenuItem value="Applied">Applied</MenuItem>
              <MenuItem value="Shortlisted">Shortlist</MenuItem>
              <MenuItem value="Technical Round">Technical Round</MenuItem>
              <MenuItem value="HR Round">HR Round</MenuItem>
              <MenuItem value="Selected">Selected</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>

            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="OFFERED">Offered</MenuItem>
              <MenuItem value="HIRED">Hired</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
            </Select>

            <Button
              startIcon={<RestartAlt />}
              onClick={() => {
                setSearch("");
                setStageFilter("");
                setStatusFilter("");
                setSelectedJob(null);
              }}
            >
              Reset
            </Button>
          </Stack>

          {/* TABLE */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job Slug</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.candidateName}</TableCell>
                    <TableCell>{row.jobSlug}</TableCell>
                    <TableCell>
                      <Chip label={row.stage} color="info" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={
                          row.status === "REJECTED"
                            ? "error"
                            : row.status === "SHORTLISTED"
                              ? "success"
                              : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(row.appliedAt).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          handleAction(row.id);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalRows}
              page={page}
              onPageChange={(event, newPage) => {
                setPage(newPage);
              }}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[2, 5, 10]}
            />
          </TableContainer>
        </CardContent>
      </Card>

      <ApplicationDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        application={selectedApplication}
        setSelectedApplication={setSelectedApplication}
        refreshList={fetchApplications}
      />
    </Container>
  );
}

function ApplicationDetailDrawer({
  open,
  onClose,
  application,
  setSelectedApplication,
  refreshList,
}) {
  const [tab, setTab] = useState(0);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (tab === 2) {
      const fetchInterviewers = async () => {
        try {
          const res = await getInterviewers();
          if (res?.success) {
            setInterviewers(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchInterviewers();
    }
  }, [tab]);

  const handleShortlist = async () => {
    try {
      const res = await shortlistApplication(application.id);

      if (res?.success) {
        setSelectedApplication((prev) => ({
          ...prev,
          currentStage: {
            ...prev.currentStage,
            name: "Shortlisted",
          },
        }));
        setTab(2);
        refreshList();
        toast.success(res.message || "Application shortlisted successfully");
      } else {
        toast.error(res?.message || "Failed to shortlist application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while shortlisting");
    }
  };

  const handleReject = async () => {
    try {
      const res = await rejectApplication(application.id);

      if (res?.success) {
        setSelectedApplication((prev) => ({
          ...prev,
          status: "REJECTED",
          currentStage: {
            ...prev.currentStage,
            name: "Rejected",
          },
        }));
        refreshList();
        onClose();

        toast.success("Application rejected successfully");
      } else {
        toast.error("Failed to reject application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while rejecting");
    }
  };

  const currentStage = application?.currentStage?.name?.toUpperCase() || "";
  const status = application?.status?.toUpperCase() || "";

  const isRejectedStage = currentStage === "REJECTED";
  const isShortlisted = currentStage === "SHORTLISTED";
  const isApplied = currentStage === "APPLIED";
  const isInterview = currentStage === "INTERVIEW";
  const isFinalStatus = status === "OFFERED" || status === "HIRED";

  if (!application) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 500, md: "40%" },
            maxWidth: "80%",
            p: 3,
          },
        }}
      >
        <Typography>Loading application details...</Typography>
      </Drawer>
    );
  }

  const candidate = application?.candidate || {};
  const job = application?.jobPosting || {};
  const req = job.requisition || {};

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500, md: "40%" },
          maxWidth: "80%",
          p: 3,
        },
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">Application Details</Typography>

          <Chip label={application.status} />
        </Stack>

        <Divider />

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Job Details" />
          <Tab label="Candidate Details" />
          <Tab label="Interview Setup" />
        </Tabs>

        {/* TAB 1 — JOB */}
        {tab === 0 && (
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <DetailRow label="Title" value={job.title} />
                <DetailRow label="Slug" value={job.slug} />
                <DetailRow label="Employment Type" value={req.employmentType} />
                <DetailRow label="Location" value={req.location} />
                <DetailRow label="Job Openings" value={req.headCount} />
              </Grid>

              <Grid item xs={6}>
                <DetailRow
                  label="Experience Range"
                  value={
                    job.requisition
                      ? `${job.requisition.experienceMin} - ${job.requisition.experienceMax} yrs`
                      : "N/A"
                  }
                />

                <DetailRow
                  label="Budget Range"
                  value={
                    job.requisition
                      ? `₹${job.requisition.budgetMin} - ₹${job.requisition.budgetMax}`
                      : "N/A"
                  }
                />

                <DetailRow
                  label="Published At"
                  value={dayjs(job.publishedAt).format("DD MMM YYYY")}
                />

                <DetailRow
                  label="Expires At"
                  value={dayjs(job.expiresAt).format("DD MMM YYYY")}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600}>
              Job Description
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 2,
                background: "#f5f5f5",
                borderRadius: 2,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {job.description}
              </Typography>
            </Box>
          </Card>
        )}

        {/* TAB 2 — CANDIDATE */}
        {tab === 1 && (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Candidate Profile
              </Typography>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* LEFT COLUMN */}
                <Grid item xs={6}>
                  <DetailRow
                    icon={<Email />}
                    label="Email"
                    value={candidate.email}
                  />
                  <DetailRow
                    icon={<Phone />}
                    label="Contact"
                    value={candidate.contact}
                  />
                  <DetailRow
                    icon={<LocationOn />}
                    label="City"
                    value={candidate.city}
                  />
                  <DetailRow
                    icon={<Public />}
                    label="Country"
                    value={candidate.country}
                  />
                  <DetailRow
                    icon={<Business />}
                    label="Current Company"
                    value={candidate.currentCompany}
                  />
                </Grid>

                {/* RIGHT COLUMN */}
                <Grid item xs={6}>
                  <DetailRow
                    icon={<WorkHistory />}
                    label="Total Experience"
                    value={
                      candidate.totalExperience
                        ? `${candidate.totalExperience} years`
                        : "N/A"
                    }
                  />
                  <DetailRow
                    icon={<CurrencyRupee />}
                    label="Current CTC"
                    value={
                      candidate.currentCTC ? `₹${candidate.currentCTC}` : "N/A"
                    }
                  />

                  <DetailRow
                    icon={<CurrencyRupee />}
                    label="Expected CTC"
                    value={
                      candidate.expectedCTC
                        ? `₹${candidate.expectedCTC}`
                        : "N/A"
                    }
                  />

                  <DetailRow
                    icon={<Schedule />}
                    label="Notice Period"
                    value={
                      candidate.noticePeriodDays
                        ? `${candidate.noticePeriodDays} days`
                        : "N/A"
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* External Links */}
              <Stack direction="row" spacing={2}>
                {candidate.linkedInUrl && (
                  <Button
                    startIcon={<LinkedIn />}
                    variant="outlined"
                    href={candidate.linkedInUrl}
                    target="_blank"
                  >
                    LinkedIn
                  </Button>
                )}

                {candidate.portfolioUrl && (
                  <Button
                    startIcon={<Language />}
                    variant="outlined"
                    href={candidate.portfolioUrl}
                    target="_blank"
                  >
                    Portfolio
                  </Button>
                )}
              </Stack>
              <Divider sx={{ my: 3 }} />

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2}>
                {isFinalStatus && <Chip label={status} color="default" />}

                {!isFinalStatus && isRejectedStage && (
                  <Chip label="Rejected" color="error" icon={<Cancel />} />
                )}

                {!isFinalStatus && isShortlisted && (
                  <>
                    <Chip
                      label="Shortlisted"
                      color="success"
                      icon={<CheckCircle />}
                    />

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleReject}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        px: 3,
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {!isFinalStatus && isApplied && (
                  <>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleShortlist}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        px: 3,
                      }}
                    >
                      Shortlist
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleReject}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        px: 3,
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {!isFinalStatus && isInterview && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={handleReject}
                    sx={{
                      borderRadius: "999px",
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    Reject
                  </Button>
                )}
              </Stack>
            </Card>

            {/* Resume Preview */}
            {/* <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume Preview
              </Typography>

              {candidate.resumeUrl ? (
                <Box
                  component="iframe"
                  src={candidate.resumeUrl}
                  sx={{
                    width: "100%",
                    height: 500,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  Resume not uploaded
                </Typography>
              )}
            </Card> */}
          </Stack>
        )}

        {/* TAB 3 — INTERVIEW */}
        {tab === 2 && (
          <InterviewTab
            application={application}
            interviewers={interviewers}
            refreshList={refreshList}
            onClose={onClose}
          />
        )}
      </Stack>
    </Drawer>
  );
}

function InterviewTab({ application, interviewers, refreshList, onClose }) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    mode: "ONLINE",
    interviewerId: null,
    meetingUrl: "",
    location: "",
    duration: 60,
  });

  const handleSave = async () => {
    if (!form.date || !form.time || !form.interviewerId) {
      toast.error("Please select date, time and interviewer");
      return;
    }

    const scheduledAt = dayjs(
      `${form.date} ${form.time}`,
      "YYYY-MM-DD HH:mm",
    ).toISOString();

    const data = {
      applicationId: application.id,
      interviewerId: form.interviewerId,
      scheduledAt,
      mode: form.mode,
      meetingUrl: form.meetingUrl,
      location: form.location,
      duration: form.duration,
    };

    try {
      const response = await assignInterview(data);
      if (response.success) {
        toast.success("Interview scheduled successfully");
        setForm({
          date: "",
          time: "",
          mode: "ONLINE",
          interviewerId: null,
          meetingUrl: "",
          location: "",
          duration: 60,
        });
        refreshList();
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6">Schedule Interview</Typography>

      <Stack spacing={3} mt={2}>
        {/* Interviewer Dropdown */}
        <Autocomplete
          options={interviewers}
          getOptionLabel={(option) => `${option?.email?.split("@")[0]}`}
          onChange={(event, value) =>
            setForm({
              ...form,
              interviewerId: value?.id || null,
            })
          }
          renderInput={(params) => (
            <TextField {...params} label="Select Interviewer" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        {/* Date */}
        <TextField
          type="date"
          label="Interview Date"
          InputLabelProps={{ shrink: true }}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          fullWidth
        />

        {/* Time */}
        <TextField
          type="time"
          label="Interview Time"
          InputLabelProps={{ shrink: true }}
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          fullWidth
        />

        {/* Mode */}
        <Select
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
        >
          <MenuItem value="ONLINE">Online</MenuItem>
          <MenuItem value="OFFLINE">Offline</MenuItem>
        </Select>

        {form.mode === "ONLINE" && (
          <TextField
            label="Meeting URL"
            value={form.meetingUrl}
            onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
          />
        )}

        {form.mode === "OFFLINE" && (
          <TextField
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        )}

        <Select
          value={form.duration}
          onChange={(e) =>
            setForm({ ...form, duration: Number(e.target.value) })
          }
          fullWidth
        >
          <MenuItem value={30}>30 Minutes</MenuItem>
          <MenuItem value={45}>45 Minutes</MenuItem>
          <MenuItem value={60}>60 Minutes</MenuItem>
          <MenuItem value={90}>90 Minutes</MenuItem>
          <MenuItem value={120}>120 Minutes</MenuItem>
        </Select>

        <Button
          variant="contained"
          onClick={() => handleSave()}
          disabled={!form.date || !form.time || !form.interviewerId}
          sx={{ width: 200 }}
        >
          Save Interview
        </Button>
      </Stack>
    </Card>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
      <Box color="text.secondary">{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Stack>
  );
}
