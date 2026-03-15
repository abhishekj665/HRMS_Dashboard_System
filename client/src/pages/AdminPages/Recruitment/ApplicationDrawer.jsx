import {
  Box,
  Card,
  Stack,
  TextField,
  Button,
  Chip,
  Drawer,
  Typography,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";

import DetailRow from "./Detail";

import { Visibility, CheckCircle, Cancel } from "@mui/icons-material";

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

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  shortlistApplication,
  rejectApplication,
} from "../../../services/JobRecruitmentService/appllicationService";
import { useNavigate } from "react-router-dom";

import { generateOffer } from "../../../services/JobRecruitmentService/offerService";
import { getManagers } from "../../../services/AdminService/managerService";
import { toast } from "react-toastify";
import { Alert } from "@mui/material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { getInterviewers } from "../../../services/JobRecruitmentService/interviewService";
import { getActiveInterview } from "../../../services/JobRecruitmentService/interviewService";

import { moveToNextStage } from "../../../services/JobRecruitmentService/stageService";

import InterviewTab from "./InterviewTab";

export default function ApplicationDetailDrawer({
  open,
  onClose,
  application,
  setSelectedApplication,
  refreshList,
}) {
  const [tab, setTab] = useState(0);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const [selectedManager, setSelectedManager] = useState(null);
  const [managers, setManagers] = useState([]);

  const [resumeOpen, setResumeOpen] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [offerForm, setOfferForm] = useState({
    offeredCTC: "",
    bonus: "",
    joiningDate: "",
    remarks: "",
  });

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

  const handleMoveNextStage = async () => {
    try {
      const response = await moveToNextStage(application.id);

      if (response.success) {
        toast.success("Candidate moved to next stage");

        setSelectedApplication((prev) => ({
          ...prev,
          status: "ACTIVE",
        }));

        refreshList();
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Failed to move candidate");
    }
  };

  const handleGenerateOffer = async () => {
    try {
      if (!offerForm.offeredCTC || !offerForm.joiningDate) {
        toast.error("Please fill required fields");
        return;
      }

      const payload = {
        offeredCTC: offerForm.offeredCTC,
        bonus: offerForm.bonus,
        joiningDate: offerForm.joiningDate,
        remarks: offerForm.remarks,
      };

      const res = await generateOffer(application.id, payload);

      if (res.success) {
        toast.success("Offer generated successfully");
        refreshList();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const currentStage = application?.currentStage?.name?.toUpperCase() || "";
  const status = application?.status?.toUpperCase() || "";

  const showOfferGeneration =
    currentStage === "SELECTED" && !["OFFERED", "HIRED"].includes(status);

  const isRejected = status === "REJECTED";
  const isShortlisted = currentStage === "SHORTLISTED";
  const isApplied = currentStage === "APPLIED";
  const isInterview = currentStage === "INTERVIEW";
  const isFinalStatus =
    status === "OFFERED" || status === "HIRED" || status === "REJECTED";
  const isSelected = currentStage === "SELECTED";
  const isOffered = status === "OFFERED";
  const isHired = status === "HIRED";
  const isOnHold = status === "ON_HOLD";

  const INTERVIEW_STAGES = ["SHORTLISTED", "TECHNICAL ROUND", "HR ROUND"];

  const canScheduleInterview =
    INTERVIEW_STAGES.includes(currentStage) &&
    !["ON_HOLD", "REJECTED", "OFFERED", "HIRED"].includes(status);

  useEffect(() => {
    if (open) {
      setTab(0);
    }
  }, [open, application?.id]);

  useEffect(() => {
    if (!open) return;

    const fetchManagers = async () => {
      const res = await getManagers();
      if (res?.success) setManagers(res.data);
    };

    fetchManagers();
  }, [open]);

  useEffect(() => {
    if (isOnHold && tab === 2) {
      setTab(1);
    }
  }, [isOnHold]);

  console.log("application", application);
  console.log("interviews", application?.interviews);
  console.log("latestInterview", application?.interviews?.[0]);
  console.log("feedback", application?.interviews?.[0]?.feedbacks);
  console.log("status", status);
  console.log("isOnHold", isOnHold);

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

  const latestInterview = application?.interviews?.[0] || null;
  const feedback = latestInterview?.feedbacks || null;

  const technicalScore = feedback?.technicalScore || 0;
  const communicationScore = feedback?.communicationScore || 0;
  const problemSolvingScore = feedback?.problemSolvingScore || 0;
  const remark = feedback?.remark || "No remarks provided";

  const totalScore = technicalScore + communicationScore + problemSolvingScore;

  const isManagerAssigned = !!application?.assignedManager;

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
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Application Details</Typography>
            <Chip label={application.status} />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            flexWrap="wrap"
          >
            <Chip
              label="Applied"
              color={currentStage === "APPLIED" ? "primary" : "default"}
            />

            <Chip
              label="Shortlisted"
              color={currentStage === "SHORTLISTED" ? "primary" : "default"}
            />

            <Chip
              label="Technical"
              color={currentStage === "TECHNICAL ROUND" ? "primary" : "default"}
            />

            <Chip
              label="HR"
              color={currentStage === "HR ROUND" ? "primary" : "default"}
            />

            <Chip
              label="Selected"
              color={currentStage === "SELECTED" ? "primary" : "default"}
            />

            {status === "HIRED" ? (
              <Chip label="Hired" color="success" />
            ) : (
              <Chip
                label="Offer"
                color={status === "OFFERED" ? "success" : "default"}
              />
            )}
          </Stack>
        </Stack>

        <Divider />

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, v) => {
            if (v === 2 && !canScheduleInterview) return;
            setTab(v);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Job Details" />
          <Tab label="Candidate Details" />
          {canScheduleInterview && <Tab label="Interview Setup" />}
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

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography fontWeight={500}>Resume</Typography>

                {candidate.resumeUrl ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => setResumeOpen(true)}
                    sx={{
                      borderRadius: "999px",
                      textTransform: "none",
                    }}
                  >
                    View Resume
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not Uploaded
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2}>
                {isFinalStatus && <Chip label={status} color="default" />}

                {!isFinalStatus && isRejected && (
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

              {showOfferGeneration && (
                <Card
                  variant="outlined"
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    border: "1px dashed #d0d7de",
                    background: "#fafafa",
                  }}
                >
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorkHistory color="primary" />
                      <Typography variant="h6">Offer Preparation</Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      The candidate has successfully cleared all interview
                      rounds. Please assign a reporting manager before
                      generating the offer.
                    </Typography>

                    <TextField
                      label="Offered CTC"
                      type="number"
                      value={offerForm.offeredCTC}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          offeredCTC: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="Bonus"
                      type="number"
                      value={offerForm.bonus}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, bonus: e.target.value })
                      }
                    />

                    <TextField
                      label="Joining Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={offerForm.joiningDate}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          joiningDate: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="Remarks"
                      multiline
                      rows={3}
                      value={offerForm.remarks}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, remarks: e.target.value })
                      }
                    />

                    <Button
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={handleGenerateOffer}
                      sx={{
                        borderRadius: "999px",
                        width: 200,
                        textTransform: "none",
                      }}
                    >
                      Generate Offer
                    </Button>
                  </Stack>
                </Card>
              )}

              {isOffered && (
                <Card
                  variant="outlined"
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #b7eb8f",
                    background: "#f6fffa",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle color="success" />
                      <Typography variant="h6">Offer Generated</Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      The offer letter has already been generated for this
                      candidate.
                    </Typography>

                    <Stack direction="row" spacing={2}>
                      <Chip
                        icon={<WorkHistory />}
                        label="Offer Stage"
                        color="success"
                      />

                      <Chip
                        icon={<Business />}
                        label={`Manager: ${application.assignedManager?.email || "Assigned"}`}
                        color="info"
                      />
                    </Stack>
                  </Stack>
                </Card>
              )}

              {isHired && (
                <Card
                  variant="outlined"
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #52c41a",
                    background: "#f6ffed",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle color="success" />
                      <Typography variant="h6">Candidate Hired</Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      This candidate has accepted the offer and is now
                      officially hired. The onboarding process has been
                      initiated and the employee account has been created.
                    </Typography>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      flexWrap="wrap"
                    >
                      <Chip
                        icon={<WorkHistory />}
                        label="Employee"
                        color="success"
                      />

                      {/* <Chip
                        icon={<Business />}
                        label={`Manager: ${
                          application.assignedManager?.email || "Not Assigned"
                        }`}
                        color={application.assignedManager ? "info" : "warning"}
                      /> */}

                      <Chip
                        icon={<Schedule />}
                        label={`Joining Date: ${
                          application.offer?.joiningDate
                            ? dayjs(application.offer.joiningDate).format(
                                "DD MMM YYYY",
                              )
                            : "-"
                        }`}
                        color="primary"
                      />
                    </Stack>

                    <Divider />

                    <Typography variant="body2" color="text.secondary">
                      The candidate will receive login credentials and can
                      access the employee dashboard.
                    </Typography>
                  </Stack>
                </Card>
              )}

              {isRejected && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  This application has been rejected. Interview scheduling is
                  disabled.
                </Alert>
              )}
            </Card>
            {/* {isHired && !isManagerAssigned && (
              <Card
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  border: "1px dashed #faad14",
                  background: "#fffbe6",
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business color="warning" />
                    <Typography variant="h6">
                      Assign Reporting Manager
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    The employee has been created but no reporting manager is
                    assigned yet. Please assign a manager to complete
                    onboarding.
                  </Typography>

                  <Autocomplete
                    options={managers}
                    getOptionLabel={(option) => option?.email || ""}
                    onChange={(event, value) => setSelectedManager(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Manager" fullWidth />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                  />

                  <Button
                    variant="contained"
                    startIcon={<Business />}
                    sx={{
                      borderRadius: "999px",
                      textTransform: "none",
                      width: 200,
                    }}
                    onClick={async () => {
                      if (!selectedManager) {
                        toast.error("Please select a manager");
                        return;
                      }

                      try {
                        const res = await assignManager(
                          application.id,
                          selectedManager.id,
                        );

                        if (!res?.success) {
                          toast.error(
                            res?.message || "Failed to assign manager",
                          );
                          return;
                        }

                        toast.success("Manager assigned successfully");

                        refreshList();
                        onClose();
                      } catch (error) {
                        toast.error("Failed to assign manager");
                      }
                    }}
                  >
                    Assign Manager
                  </Button>
                </Stack>
              </Card>
            )} */}

            {isOnHold && (
              <Card
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  border: "1px dashed #faad14",
                  background: "#fffbe6",
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Schedule color="warning" />
                    <Typography variant="h6">Application On Hold</Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    This candidate has been marked as <b>On Hold</b> after
                    interview evaluation. Please review the feedback and decide
                    the next action.
                  </Typography>

                  {/* SCORE SECTION */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Chip
                        icon={<WorkHistory />}
                        label={`Technical: ${technicalScore || 0}`}
                        color="info"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Chip
                        icon={<Language />}
                        label={`Communication: ${communicationScore || 0}`}
                        color="primary"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Chip
                        icon={<CheckCircle />}
                        label={`Problem Solving: ${problemSolvingScore || 0}`}
                        color="success"
                      />
                      <Chip
                        icon={<CheckCircle />}
                        label={`Total Score: ${totalScore}`}
                        color="warning"
                      />
                    </Grid>
                  </Grid>

                  {/* REMARKS */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "#fafafa",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Interview Remarks
                    </Typography>

                    <Typography variant="body2">
                      {remark || "No remarks provided"}
                    </Typography>
                  </Box>

                  {/* ACTION BUTTONS */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="flex-start"
                  >
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        px: 4,
                      }}
                      onClick={() => handleMoveNextStage()}
                    >
                      Move To Next Stage
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        px: 4,
                      }}
                      onClick={handleReject}
                    >
                      Reject Candidate
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Resume Preview */}
          </Stack>
        )}

        {/* TAB 3 — INTERVIEW */}
        {tab === 2 && canScheduleInterview && (
          <InterviewTab
            application={application}
            interviewers={interviewers}
            refreshList={refreshList}
            onClose={onClose}
          />
        )}
      </Stack>
      <Dialog
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Candidate Resume</DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            height: "80vh",
          }}
        >
          <iframe
            src={candidate.resumeUrl}
            title="Resume"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
