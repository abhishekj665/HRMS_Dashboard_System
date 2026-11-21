import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { applyInternalJob } from "../../services/JobRecruitmentService/internalJobsService";

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
  danger: "#b91c1c",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const steps = [
  "Information",
  "Contact & Address",
  "Professional Details",
  "Resume & Links",
  "Declaration",
];

const stepMeta = [
  {
    title: "Basic information",
    description:
      "We filled these from your employee profile. Please confirm they are correct.",
  },
  {
    title: "Contact & address",
    description: "Where the recruitment team can reach you.",
  },
  {
    title: "Professional details",
    description: "Your current role, compensation and availability.",
  },
  {
    title: "Resume & links",
    description: "Upload an up-to-date resume and add your public profiles.",
  },
  {
    title: "Review & declare",
    description: "Check your details once more before submitting.",
  },
];

const fieldGroups = [
  [
    { name: "firstName", label: "First Name", required: true, cols: 3 },
    { name: "lastName", label: "Last Name", required: true, cols: 3 },
    { name: "email", label: "Email", type: "email", required: true, cols: 6 },
  ],
  [
    { name: "contact", label: "Contact Number", required: true, cols: 6 },
    { name: "address", label: "Address", required: true, cols: 6 },
    { name: "city", label: "City", required: true, cols: 2 },
    { name: "state", label: "State", required: true, cols: 2 },
    { name: "country", label: "Country", required: true, cols: 2 },
  ],
  [
    { name: "currentCompany", label: "Current Company", required: true, cols: 3 },
    {
      name: "totalExperience",
      label: "Total Experience (Years)",
      type: "number",
      required: true,
      cols: 3,
    },
    {
      name: "currentCTC",
      label: "Current CTC",
      type: "number",
      required: true,
      cols: 3,
    },
    {
      name: "expectedCTC",
      label: "Expected CTC",
      type: "number",
      required: true,
      cols: 3,
    },
    {
      name: "noticePeriodDays",
      label: "Notice Period (Days)",
      type: "number",
      required: true,
      cols: 3,
    },
    { name: "source", label: "Source", required: true, cols: 3 },
  ],
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tokens.surface,
  },
};

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getDisplayName = (employee) =>
  employee?.name ||
  (employee?.email ? toTitleCase(employee.email.split("@")[0]) : "") ||
  "Employee";

const capitalizeWord = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const getInitials = (name) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "E";

const buildInitialForm = (employee) => {
  const [splitFirst = "", ...splitRest] = (employee?.name || "")
    .trim()
    .split(/\s+/);

  return {
    firstName: employee?.firstName || splitFirst,
    lastName: employee?.lastName || splitRest.join(" "),
    email: employee?.email || "",
    contact: employee?.phone ? String(employee.phone) : "",
    currentCompany: "",
    totalExperience: "",
    expectedCTC: "",
    currentCTC: "",
    noticePeriodDays: "",
    linkedInUrl: "",
    portfolioUrl: "",
    address: employee?.address ? String(employee.address) : "",
    city: employee?.city ? String(employee.city) : "",
    state: employee?.state ? String(employee.state) : "",
    country: employee?.country ? String(employee.country) : "",
    source: "Internal",
  };
};

function SummaryRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        py: 1.25,
        "&:not(:last-of-type)": { borderBottom: `1px solid ${tokens.borderSoft}` },
      }}
    >
      <Typography sx={{ fontSize: 13, color: tokens.muted, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: tokens.text,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "--"}
      </Typography>
    </Box>
  );
}

export default function InternalApplyForm({
  jobId,
  jobSlug,
  jobTitle,
  employee,
  onBack,
  onDone,
}) {
  const displayName = getDisplayName(employee);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(() => buildInitialForm(employee));
  const [resumeFile, setResumeFile] = useState(null);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    if (!submitted) return undefined;
    const timer = setTimeout(() => onDone?.(), 4000);
    return () => clearTimeout(timer);
  }, [submitted, onDone]);

  const showToast = (message, severity = "error") =>
    setToast({ open: true, message, severity });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      showToast("Only PDF, DOC or DOCX files are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("File size must be under 5 MB");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
    setErrors((prev) => ({ ...prev, resumeFile: "" }));
    event.target.value = "";
  };

  const validateStep = (step) => {
    const nextErrors = {};

    if (step < 3) {
      fieldGroups[step].forEach((field) => {
        if (field.required && !String(form[field.name] ?? "").trim()) {
          nextErrors[field.name] = "This field is required";
        }
      });
    }

    if (step === 3) {
      if (!resumeFile) nextErrors.resumeFile = "Resume is required";
      if (!form.linkedInUrl.trim()) {
        nextErrors.linkedInUrl = "LinkedIn URL is required";
      }
    }

    if (step === 4 && !agree) {
      nextErrors.agree = "You must accept the declaration to continue";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast("Please complete the required fields");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onBack?.();
      return;
    }
    setActiveStep((prev) => prev - 1);
  };

  const finish = (status) => {
    setApplicationStatus(status);
    setSubmitted(true);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      formData.append("jobId", jobId);

      if (employee?.employeeId) {
        formData.append("employeeId", employee.employeeId);
      }

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await applyInternalJob(jobSlug || jobId, formData);

      if (response?.success) {
        showToast(response.message || "Application submitted", "success");
        finish("submitted");
      } else if (response?.status === 406) {
        finish("already_applied");
      } else {
        showToast(response?.message || "Application failed");
      }
    } catch (err) {
      if (err?.response?.status === 406) {
        finish("already_applied");
      } else {
        showToast(err?.response?.data?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderFields = (fields) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(6, minmax(0, 1fr))" },
        gap: 2.5,
      }}
    >
      {fields.map((field) => (
        <Box
          key={field.name}
          sx={{ gridColumn: { xs: "1 / -1", sm: `span ${field.cols}` } }}
        >
          <TextField
            fullWidth
            required={field.required}
            label={field.label}
            name={field.name}
            type={field.type || "text"}
            value={form[field.name]}
            error={Boolean(errors[field.name])}
            helperText={errors[field.name]}
            onChange={handleChange}
            InputProps={{
              readOnly: field.name === "email" && Boolean(employee?.email),
            }}
            sx={fieldSx}
          />
        </Box>
      ))}
    </Box>
  );

  const renderResumeStep = () => (
    <Box>
      <Box
        component="label"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 0.75,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          cursor: "pointer",
          bgcolor: errors.resumeFile ? "#fef2f2" : tokens.bg,
          border: `1.5px dashed ${
            errors.resumeFile ? "#fecaca" : tokens.accentBorder
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
        <Typography sx={{ fontWeight: 600, color: tokens.text, fontSize: 14.5 }}>
          {resumeFile ? "Change resume" : "Click to upload your resume"}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.muted }}>
          PDF, DOC or DOCX up to 5 MB
        </Typography>
        <input
          hidden
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeChange}
        />
      </Box>

      {errors.resumeFile && (
        <Typography sx={{ fontSize: 12.5, color: tokens.danger, mt: 1 }}>
          {errors.resumeFile}
        </Typography>
      )}

      {resumeFile && (
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
              {resumeFile.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: tokens.muted }}>
              {(resumeFile.size / 1024).toFixed(0)} KB
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Remove resume"
            onClick={() => setResumeFile(null)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 2.5,
        }}
      >
        <TextField
          fullWidth
          required
          label="LinkedIn URL"
          name="linkedInUrl"
          value={form.linkedInUrl}
          error={Boolean(errors.linkedInUrl)}
          helperText={errors.linkedInUrl}
          onChange={handleChange}
          sx={fieldSx}
        />
        <TextField
          fullWidth
          label="Portfolio / GitHub URL (Optional)"
          name="portfolioUrl"
          value={form.portfolioUrl}
          onChange={handleChange}
          sx={fieldSx}
        />
      </Box>
    </Box>
  );

  const renderDeclarationStep = () => (
    <Box>
      <Box
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: 2.5,
          border: `1px solid ${tokens.border}`,
          bgcolor: tokens.bg,
        }}
      >
        <SummaryRow label="Name" value={`${form.firstName} ${form.lastName}`} />
        <SummaryRow label="Email" value={form.email} />
        <SummaryRow label="Contact" value={form.contact} />
        <SummaryRow
          label="Location"
          value={[form.city, form.state, form.country].filter(Boolean).join(", ")}
        />
        <SummaryRow
          label="Experience"
          value={form.totalExperience ? `${form.totalExperience} years` : ""}
        />
        <SummaryRow label="Expected CTC" value={form.expectedCTC} />
        <SummaryRow label="Resume" value={resumeFile?.name} />
      </Box>

      <Typography
        sx={{ mt: 3, fontSize: 13.5, lineHeight: 1.65, color: tokens.body }}
      >
        I certify that all information provided is true and complete. I
        authorize the company to verify my credentials and background.
      </Typography>

      <FormControlLabel
        sx={{ mt: 1, alignItems: "flex-start" }}
        control={
          <Checkbox
            checked={agree}
            onChange={(event) => {
              setAgree(event.target.checked);
              if (errors.agree) setErrors((prev) => ({ ...prev, agree: "" }));
            }}
            sx={{ pt: 0.75 }}
          />
        }
        label={
          <Typography sx={{ fontSize: 13.5, color: tokens.text, pt: 0.75 }}>
            I agree to the terms and privacy policy
          </Typography>
        }
      />

      {errors.agree && (
        <Typography sx={{ fontSize: 12.5, color: tokens.danger, mt: 0.5 }}>
          {errors.agree}
        </Typography>
      )}
    </Box>
  );

  if (submitted) {
    const alreadyApplied = applicationStatus === "already_applied";

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
            bgcolor: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
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
          {alreadyApplied
            ? "You have already applied"
            : "Application submitted"}
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
          {alreadyApplied
            ? `Your application for ${jobTitle} is already with the recruitment team.`
            : `Thank you for applying for ${jobTitle}. The recruitment team will review your application and get back to you.`}
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => onDone?.()}
          sx={{
            mt: 3,
            px: 4,
            py: 1.1,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: tokens.accent,
            "&:hover": { bgcolor: "#1e40af" },
          }}
        >
          Done
        </Button>
      </Box>
    );
  }

  const isLastStep = activeStep === steps.length - 1;
  const meta = stepMeta[activeStep];

  return (
    <Box>
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
          {getInitials(displayName)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            sx={{ fontSize: 14, fontWeight: 700, color: tokens.text }}
          >
            {displayName}
          </Typography>
          <Typography noWrap sx={{ fontSize: 12.5, color: tokens.muted }}>
            {[employee?.designation, employee?.department]
              .filter(Boolean)
              .map(capitalizeWord)
              .join(" · ") || "Internal applicant"}
          </Typography>
        </Box>
      </Box>

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{ display: { xs: "none", sm: "flex" }, mb: 4 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": { fontSize: 12.5, mt: 0.75 },
                "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed":
                  { color: tokens.accent },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ display: { xs: "block", sm: "none" }, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>
            {steps[activeStep]}
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.muted }}>
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / steps.length) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: tokens.borderSoft,
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              bgcolor: tokens.accent,
            },
          }}
        />
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
          {meta.title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: tokens.muted, mt: 0.25 }}>
          {meta.description}
        </Typography>
      </Box>

      {activeStep < 3 && renderFields(fieldGroups[activeStep])}
      {activeStep === 3 && renderResumeStep()}
      {activeStep === 4 && renderDeclarationStep()}

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
          onClick={handleBack}
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
          {activeStep === 0 ? "Back to details" : "Back"}
        </Button>

        <Button
          variant="contained"
          disableElevation
          disabled={submitting}
          onClick={isLastStep ? handleSubmit : handleNext}
          sx={{
            px: 4,
            py: 1.1,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: tokens.accent,
            "&:hover": { bgcolor: "#1e40af" },
          }}
        >
          {isLastStep
            ? submitting
              ? "Submitting..."
              : "Submit Application"
            : "Continue"}
        </Button>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
