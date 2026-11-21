import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import { submitReferral } from "../../services/JobRecruitmentService/internalJobsService";

const MAX_FILE_MB = 5;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const EMPTY_VALUES = { name: "", email: "", phone: "", note: "" };

const tokens = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderSoft: "#f1f5f9",
  text: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  accent: "#1d4ed8",
  accentHover: "#1e40af",
  accentSoft: "#eff6ff",
  accentBorder: "#bfdbfe",
  danger: "#b91c1c",
  dangerSoft: "#fef2f2",
  dangerBorder: "#fecaca",
  success: "#15803d",
  successSoft: "#f0fdf4",
  successBorder: "#bbf7d0",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tokens.surface,
  },
};

const getInitials = (name) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "R";

function SectionLabel({ title, description }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
          color: tokens.text,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 13, color: tokens.muted, mt: 0.25 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

export default function ReferralForm({
  jobId,
  jobTitle,
  jobSlug,
  referrerName,
  onBack,
  onDone,
}) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setErrors((prev) => ({
        ...prev,
        resume: "Only PDF, DOC or DOCX files are allowed",
      }));
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        resume: `File must be under ${MAX_FILE_MB} MB`,
      }));
      return;
    }

    setResume(file);
    setErrors((prev) => ({ ...prev, resume: "" }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Enter candidate name";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
      next.email = "Enter a valid email address";
    if (values.phone && !/^[0-9+\-\s]{7,15}$/.test(values.phone.trim())) {
      next.phone = "Enter a valid phone number";
    }
    if (!resume) next.resume = "Please attach a resume";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("candidateName", values.name.trim());
      formData.append("candidateEmail", values.email.trim());
      formData.append("candidatePhone", values.phone.trim());
      formData.append("note", values.note.trim());
      formData.append("resume", resume);

      const response = await submitReferral(jobSlug, formData);
      if (!response?.success) throw new Error(response?.message || "Could not send the referral");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Could not send the referral. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box
        sx={{
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mb: 2.5,
            bgcolor: tokens.successSoft,
            color: tokens.success,
            border: `1px solid ${tokens.successBorder}`,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 34 }} />
        </Avatar>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            color: tokens.text,
            letterSpacing: "-0.01em",
          }}
        >
          Referral sent
        </Typography>
        <Typography
          sx={{
            mt: 1,
            maxWidth: 420,
            fontSize: 14,
            lineHeight: 1.6,
            color: tokens.muted,
          }}
        >
          Thanks! We have received your referral for {jobTitle}. The hiring team
          will review it soon.
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={onDone}
          sx={{
            mt: 3,
            px: 4,
            py: 1.1,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: tokens.accent,
            "&:hover": { bgcolor: tokens.accentHover },
          }}
        >
          Done
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${tokens.border}`,
          bgcolor: tokens.bg,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            fontSize: 14,
            fontWeight: 700,
            bgcolor: tokens.accentSoft,
            color: tokens.accent,
          }}
        >
          {referrerName ? (
            getInitials(referrerName)
          ) : (
            <PersonAddAltOutlinedIcon fontSize="small" />
          )}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 12, color: tokens.muted }}>
            Referring as
          </Typography>
          <Typography
            noWrap
            sx={{ fontSize: 14, fontWeight: 700, color: tokens.text }}
          >
            {referrerName || "Employee"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            color: tokens.text,
            letterSpacing: "-0.01em",
          }}
        >
          Refer a candidate
        </Typography>
        <Typography sx={{ fontSize: 13, color: tokens.muted, mt: 0.25 }}>
          Share the details of someone who would be a great fit for {jobTitle}.
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {submitError}
        </Alert>
      )}

      <SectionLabel title="Candidate details" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2.5,
        }}
      >
        <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
          <TextField
            fullWidth
            required
            label="Candidate name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            sx={fieldSx}
          />
        </Box>
        <TextField
          fullWidth
          required
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
          sx={fieldSx}
        />
        <TextField
          fullWidth
          label="Phone (optional)"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          error={Boolean(errors.phone)}
          helperText={errors.phone}
          sx={fieldSx}
        />
        <Box sx={{ gridColumn: "1 / -1" }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Why are they a good fit? (optional)"
            name="note"
            value={values.note}
            onChange={handleChange}
            sx={fieldSx}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <SectionLabel
          title="Resume"
          description={`PDF, DOC or DOCX up to ${MAX_FILE_MB} MB`}
        />

        <Box
          component="label"
          htmlFor="referral-resume-upload"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 0.75,
            p: { xs: 3, sm: 3.5 },
            borderRadius: 3,
            cursor: "pointer",
            bgcolor: errors.resume ? tokens.dangerSoft : tokens.bg,
            border: `1.5px dashed ${
              errors.resume ? tokens.dangerBorder : tokens.accentBorder
            }`,
            transition: "background-color .2s ease, border-color .2s ease",
            "&:hover": {
              bgcolor: tokens.accentSoft,
              borderColor: tokens.accent,
            },
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: tokens.accentSoft,
              color: tokens.accent,
            }}
          >
            <UploadFileOutlinedIcon />
          </Avatar>
          <Typography
            sx={{ fontWeight: 600, color: tokens.text, fontSize: 14.5 }}
          >
            {resume ? "Change resume" : "Click to attach a resume"}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: tokens.muted }}>
            The candidate's latest resume
          </Typography>
        </Box>
        <input
          id="referral-resume-upload"
          hidden
          type="file"
          accept=".pdf,.doc,.docx"
          aria-label="Attach candidate resume"
          onChange={handleFile}
        />

        {errors.resume && (
          <Typography sx={{ fontSize: 12.5, color: tokens.danger, mt: 1 }}>
            {errors.resume}
          </Typography>
        )}

        {resume && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: 2.5,
              border: `1px solid ${tokens.border}`,
              bgcolor: tokens.surface,
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: tokens.accentSoft,
                color: tokens.accent,
              }}
            >
              <InsertDriveFileOutlinedIcon fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{ fontSize: 13.5, fontWeight: 600, color: tokens.text }}
              >
                {resume.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: tokens.muted }}>
                {(resume.size / 1024).toFixed(0)} KB
              </Typography>
            </Box>
            <IconButton
              size="small"
              type="button"
              aria-label="Remove resume"
              onClick={() => setResume(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          mt: 4,
          pt: 2.5,
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "space-between",
          gap: 1.25,
          borderTop: `1px solid ${tokens.borderSoft}`,
        }}
      >
        <Button
          onClick={onBack}
          disabled={submitting}
          sx={{
            px: 3,
            py: 1.1,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            color: tokens.body,
            border: `1px solid ${tokens.border}`,
            "&:hover": { bgcolor: tokens.bg },
          }}
        >
          Back to details
        </Button>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={submitting}
          sx={{
            px: 4,
            py: 1.1,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: tokens.accent,
            "&:hover": { bgcolor: tokens.accentHover },
          }}
        >
          {submitting ? "Sending..." : "Send referral"}
        </Button>
      </Box>
    </Box>
  );
}
