import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Box,
  alpha,
} from "@mui/material";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { registerJobApplication } from "../../services/JobRecruitmentService/appllicationService";
import { getCandidate } from "../../services/JobRecruitmentService/candidateService";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";

const steps = [
  "Information",
  "Contact & Address",
  "Professional Details",
  "Resume & Links",
  "Declaration",
];

export default function JobApplicationPage() {
  const { orgSlug, slug } = useParams();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [agree, setAgree] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState({});
  const [applicationStatus, setApplicationStatus] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    currentCompany: "",
    totalExperience: "",
    expectedCTC: "",
    currentCTC: "",
    noticePeriodDays: "",
    linkedInUrl: "",
    portfolioUrl: "",
    address: "",
    city: "",
    state: "",
    country: "",
    source: "",
    resumeUrl: "",
  });
  const getCandidateDetails = async () => {
    try {
      const response = await getCandidate(form.email, orgSlug);

      if (response.success && response.data) {
        const candidate = response.data;

        setForm((prev) => ({
          ...prev,
          firstName: candidate?.firstName ?? "",
          lastName: candidate?.lastName ?? "",
          email: candidate?.email ?? "",
          contact: candidate?.contact?.toString() ?? "",
          address: candidate?.address ?? "",
          city: candidate?.city ?? "",
          state: candidate?.state ?? "",
          country: candidate?.country ?? "",
          currentCompany: candidate?.currentCompany ?? "",
          totalExperience: candidate?.totalExperience?.toString() ?? "",
          currentCTC: candidate?.currentCTC?.toString() ?? "",
          expectedCTC: candidate?.expectedCTC?.toString() ?? "",
          noticePeriodDays: candidate?.noticePeriodDays?.toString() ?? "",
          source: candidate?.source ?? "",
          linkedInUrl: candidate?.linkedInUrl ?? "",
          portfolioUrl: candidate?.portfolioUrl ?? "",
          resumeUrl: candidate?.resumeUrl ?? "",
        }));

        setToast({
          open: true,
          message: "Candidate details loaded. Please verify and continue.",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Candidate fetch error:", err);

      setToast({
        open: true,
        message: "Failed to load candidate details",
        severity: "error",
      });
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (activeStep === 0 && form.email) {
      try {
        await getCandidateDetails(form.email);
      } catch (err) {
        setToast({
          open: true,
          message: "Failed to fetch candidate details",
          severity: "error",
        });
      }
    }

    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error[name]) {
      setError((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(ext)) {
      setToast({
        open: true,
        message: "Only PDF, DOC or DOCX files are allowed",
        severity: "error",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        open: true,
        message: "File size must be under 5 MB",
        severity: "error",
      });
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setError((prev) => ({ ...prev, resumeFile: "" }));
    setToast({
      open: true,
      message: "Resume attached successfully",
      severity: "success",
    });

    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!agree) {
      setToast({
        open: true,
        message: "You must accept terms",
        severity: "error",
      });
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await registerJobApplication(orgSlug, slug, formData);

      console.log("Application response:", response);

      if (response.success) {
        setToast({
          open: true,
          message: response.message,
          severity: "success",
        });

        setSubmitted(true);

        setApplicationStatus("submitted");

        setTimeout(() => {
          navigate("/careers");
        }, 5000);
      } else if (response.status === 406) {
        setToast({
          open: true,
          message: "You have already applied for this job.",
          severity: "success",
        });

        setSubmitted(true);

        setApplicationStatus("already_applied");

        setTimeout(() => {
          navigate("/careers");
        }, 5000);
      } else {
        setToast({
          open: true,
          message: response.message || "Application failed",
          severity: "error",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Something went wrong",
        severity: "error",
      });
    }
  };

  const validateStep = () => {
    let newError = {};

    if (activeStep === 0) {
      if (!form.firstName.trim()) newError.firstName = "First name is required";

      if (!form.lastName.trim()) newError.lastName = "Last name is required";

      if (!form.email.trim()) newError.email = "Email is required";
    }

    if (activeStep === 1) {
      if (!form.contact.trim()) newError.contact = "Contact number is required";

      if (!form.address.trim()) newError.address = "Address is required";

      if (!form.city.trim()) newError.city = "City is required";

      if (!form.state.trim()) newError.state = "State is required";

      if (!form.country.trim()) newError.country = "Country is required";
    }

    if (activeStep === 2) {
      if (!form.currentCompany.trim())
        newError.currentCompany = "Current company is required";

      if (!form.totalExperience.trim())
        newError.totalExperience = "Total experience is required";

      if (!form.currentCTC.trim())
        newError.currentCTC = "Current CTC is required";

      if (!form.expectedCTC.trim())
        newError.expectedCTC = "Expected CTC is required";

      if (!form.noticePeriodDays.trim())
        newError.noticePeriodDays = "Notice period is required";

      if (!form.source.trim()) newError.source = "Source is required";
    }

    if (activeStep === 3) {
      if (!resumeFile && !form.resumeUrl) {
        newError.resumeFile = "Resume is required";
      }

      if (!form.linkedInUrl.trim())
        newError.linkedInUrl = "LinkedIn URL is required";
    }

    if (activeStep === 4) {
      if (!agree) newError.agree = "You must accept terms";
    }

    setError(newError);

    if (Object.keys(newError).length > 0) {
      setToast({
        open: true,
        message: "Please complete required fields",
        severity: "error",
      });
      return false;
    }

    return true;
  };

  return (
    <div>
      <div className="bg-white border-b">
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1.5,
              cursor: "pointer",
              width: "fit-content",
            }}
            onClick={() => navigate("/login")}
          >
            <HomeIcon fontSize="small" color="primary" />
            <Typography
              sx={{
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Home
            </Typography>
          </Box>
        </Container>
      </div>
      <Container maxWidth="md" className="py-16">
        <Typography variant="h4" mb={6}>
          Job Application
        </Typography>

        {submitted ? (
          <Box textAlign="center" mt={10}>
            <Typography variant="h4" gutterBottom>
              {applicationStatus === "already_applied"
                ? "✅ You Have Already Applied"
                : "✅ Application Submitted Successfully"}
            </Typography>

            <Typography mt={2} color="text.secondary">
              Thank you for applying. Our recruitment team will review your
              application.
            </Typography>

            <Typography mt={3} color="text.secondary">
              Redirecting to careers page in few seconds...
            </Typography>
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box mt={8}>
              {/* STEP 1 */}
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={form?.firstName}
                      error={!!error.firstName}
                      helperText={error.firstName}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      fullWidth
                      required
                      value={form?.lastName}
                      error={!!error.lastName}
                      helperText={error.lastName}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      fullWidth
                      value={form?.email}
                      error={!!error.email}
                      helperText={error.email}
                      required
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Contact Number"
                      name="contact"
                      value={form.contact}
                      error={!!error.contact}
                      helperText={error.contact}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      name="address"
                      value={form.address}
                      error={!!error.address}
                      helperText={error.address}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="City"
                      name="city"
                      value={form.city}
                      error={!!error.city}
                      helperText={error.city}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="State"
                      name="state"
                      value={form.state}
                      error={!!error.state}
                      helperText={error.state}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Country"
                      name="country"
                      value={form.country}
                      error={!!error.country}
                      helperText={error.country}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              )}

              {/* STEP 3 */}
              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Current Company"
                      name="currentCompany"
                      value={form.currentCompany}
                      error={!!error.currentCompany}
                      helperText={error.currentCompany}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Total Experience (Years)"
                      name="totalExperience"
                      type="number"
                      value={form.totalExperience}
                      error={!!error.totalExperience}
                      helperText={error.totalExperience}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Current CTC"
                      name="currentCTC"
                      type="number"
                      value={form.currentCTC}
                      error={!!error.currentCTC}
                      helperText={error.currentCTC}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Expected CTC"
                      name="expectedCTC"
                      type="number"
                      value={form.expectedCTC}
                      error={!!error.expectedCTC}
                      helperText={error.expectedCTC}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Notice Period (Days)"
                      name="noticePeriodDays"
                      type="number"
                      value={form.noticePeriodDays}
                      error={!!error.noticePeriodDays}
                      helperText={error.noticePeriodDays}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Source"
                      name="source"
                      value={form.source}
                      error={!!error.source}
                      helperText={error.source}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              )}

              {/* STEP 4 */}
              {activeStep === 3 && (
                <>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                  >
                    {resumeFile ? "Change Resume" : "Upload Resume"}
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                    />
                  </Button>

                  {resumeFile && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        border: "1px solid #e6eaf2",
                        borderRadius: 2,
                        width: "fit-content",
                        maxWidth: "100%",
                      }}
                    >
                      <InsertDriveFileOutlinedIcon color="primary" />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {resumeFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(resumeFile.size / 1024).toFixed(0)} KB
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setResumeFile(null)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {!resumeFile && form.resumeUrl && (
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      Your previously uploaded resume will be used unless you
                      upload a new one.
                    </Typography>
                  )}

                  {error.resumeFile && (
                    <Typography color="error" mt={2}>
                      {error.resumeFile}
                    </Typography>
                  )}

                  <Box mt={4}>
                    <TextField
                      label="LinkedIn URL"
                      name="linkedInUrl"
                      value={form.linkedInUrl}
                      error={!!error.linkedInUrl}
                      helperText={error.linkedInUrl}
                      fullWidth
                      required
                      onChange={handleChange}
                    />
                  </Box>

                  <Box mt={4}>
                    <TextField
                      label="Portfolio / GitHub URL (Optional)"
                      name="portfolioUrl"
                      value={form.portfolioUrl}
                      fullWidth
                      onChange={handleChange}
                    />
                  </Box>
                </>
              )}

              {activeStep === 4 && (
                <>
                  <Typography mb={3}>
                    I certify that all information provided is true and
                    complete. I authorize the company to verify my credentials
                    and background.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                    }
                    label="I agree to the terms and privacy policy"
                  />
                </>
              )}
            </Box>

            {/* ACTION BUTTONS */}
            <Box mt={6} display="flex" justifyContent="space-between">
              {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}

              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit}>
                  Submit Application
                </Button>
              )}
            </Box>
          </>
        )}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setToast({ ...toast, open: false })}
            severity={toast.severity}
            variant="filled"
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
