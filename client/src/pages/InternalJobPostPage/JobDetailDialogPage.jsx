import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { getInternalJobDetail } from "../../services/JobRecruitmentService/internalJobsService";
import JobDetailContent, {
  JobDetailSkeleton,
  getApplyLabel,
  getJobStatus,
} from "./JobDetailContent";
import InternalApplyForm from "./InternalApplyForm";
import ReferralForm from "./ReferralForm";

const text = (value) => (typeof value === "string" ? value : value?.name || "");


const getEmployeeInfo = (authUser) => {
  if (!authUser) return {};

  
  const user =
    authUser.user && typeof authUser.user === "object" ? authUser.user : authUser;

  const profile =
    user.profile && typeof user.profile === "object" ? user.profile : {};
  const pick = (...keys) => {
    for (const source of [user, profile]) {
      for (const key of keys) {
        if (source[key]) return source[key];
      }
    }
    return "";
  };

  const fullName = [
    user.first_name || user.firstName,
    user.last_name || user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    name: fullName || pick("name", "fullName"),
    email: user.email,
    phone: pick("contact", "phone", "mobile", "phoneNumber"),
    department: text(pick("department")) || pick("departmentName"),
    designation:
      text(pick("designation")) || pick("jobTitle") || text(user.role),
    employeeId: pick("employeeId", "employeeCode", "empId"),
  };
};

export default function JobDetailDialog({ jobSlug, open, visibility, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const contentRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const employee = getEmployeeInfo(user);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [view, setView] = useState("details"); 

  // Load the job whenever the dialog opens, the slug changes, or Retry is clicked.
  useEffect(() => {
    if (!open || !jobSlug) return undefined;

    let cancelled = false;
    setView("details");
    setJob(null);
    setError("");
    setLoading(true);

    (async () => {
      try {
        const response = await getInternalJobDetail(jobSlug, visibility);
        if (cancelled) return;

        if (response?.success === false) {
          setError(response.message || "This job could not be found.");
          return;
        }
        const data = response?.data?.data ?? response?.data ?? response;
        if (!data || typeof data !== "object") {
          setError("This job could not be found.");
          return;
        }
        setJob(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message || err?.message || "Unable to load this job.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Ignore the response if the dialog closes or another job is opened.
    return () => {
      cancelled = true;
    };
  }, [open, jobSlug, reloadKey]);

  // Start each form at the top.
  useEffect(() => {
    contentRef.current?.scrollTo?.({ top: 0 });
  }, [view]);

  const { isClosed } = getJobStatus(job);
  const jobId = job?._id || job?.id;

  const backToDetails = () => setView("details");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}
    >
      <DialogTitle component="div" className="flex items-center gap-1">
        {job && view !== "details" && (
          <IconButton
            edge="start"
            onClick={backToDetails}
            aria-label="Back to job details"
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton width="55%" height={32} />
          ) : (
            <Typography variant="h6" fontWeight={700} noWrap>
              {view === "apply"
                ? `Apply: ${job?.title || ""}`
                : view === "refer"
                  ? `Refer: ${job?.title || ""}`
                  : job?.title || "Job details"}
            </Typography>
          )}
        </div>

        <IconButton edge="end" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }} ref={contentRef}>
        {loading && <JobDetailSkeleton />}

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {job && view === "details" && <JobDetailContent job={job} />}

        {job && view === "apply" && (
          <InternalApplyForm
            jobId={jobId}
            jobSlug={job.slug}
            jobTitle={job.title}
            employee={employee}
            onBack={backToDetails}
            onDone={onClose}
          />
        )}

        {job && view === "refer" && (
          <ReferralForm
            jobId={jobId}
            jobTitle={job.title}
            jobSlug={job.slug}
            referrerName={employee.name}
            onBack={backToDetails}
            onDone={onClose}
          />
        )}
      </DialogContent>

      {/* Apply / Refer buttons stay visible while the details scroll */}
      {job && view === "details" && (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={isClosed}
            onClick={() => setView("refer")}
          >
            Refer a friend
          </Button>
          <Button
            variant="contained"
            disabled={isClosed}
            onClick={() => setView("apply")}
          >
            {getApplyLabel(job)}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
