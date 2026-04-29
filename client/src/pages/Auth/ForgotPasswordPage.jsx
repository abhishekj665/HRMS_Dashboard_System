import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { toast } from "react-toastify";
import {
  forgotPassword,
  resendOtp,
  resetPassword,
} from "../../services/AuthService/authService";
import Hero from "../../components/Hero/Hero";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        toast.success(response.message || "OTP sent to your email");
        setOtpSent(true);
      } else {
        toast.error(response.message || "Unable to send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send OTP");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await resendOtp(email, "FORGOT_PASSWORD");
      if (response.success) {
        toast.success(response.message || "OTP resent to your email");
      } else {
        toast.error(response.message || "Unable to resend OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to resend OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email || !formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        purpose: "FORGOT_PASSWORD",
      });

      if (response.success) {
        toast.success(response.message || "Password reset successfully");
        navigate("/login");
      } else {
        toast.error(response.message || "Unable to reset password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to reset password");
    }
  };

  return (
    <div className="w-full">
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f1f5f9",
          gap: 4,
          px: 2,
          paddingRight: "0",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 30,
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            color: "#2563eb",
          }}
          onClick={() => navigate("/careers")}
        >
          <LanguageIcon sx={{ fontSize: 22 }} />
          <Typography variant="body2" fontWeight={500}>
            Careers
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#f1f5f9",
            boxShadow: "none",
            border: "none",
            width: { xs: "92%", sm: 500 },
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Reset Password
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {otpSent
              ? "Enter the OTP sent to your email and set a new password."
              : "Enter your account email to receive a one-time OTP."}
          </Typography>

          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="1. Email"
              color={otpSent ? "success" : "primary"}
              variant={otpSent ? "outlined" : "filled"}
              size="small"
            />
            <Chip
              label="2. OTP & New Password"
              color={otpSent ? "primary" : "default"}
              variant={otpSent ? "filled" : "outlined"}
              size="small"
            />
          </Box>

          <Divider sx={{ mt: 2, mb: 2 }} />

          {otpSent && (
            <Alert severity="info" sx={{ mb: 2 }}>
              OTP sent to <strong>{email}</strong>
            </Alert>
          )}

          <Box
            component="form"
            sx={{ mt: 1 }}
            onSubmit={otpSent ? handleResetPassword : handleSendOtp}
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {otpSent && (
              <>
                <TextField
                  fullWidth
                  label="OTP"
                  margin="normal"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, otp: e.target.value }))
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  margin="normal"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  margin="normal"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.2, borderRadius: 2 }}
            >
              {otpSent ? "Reset Password" : "Send OTP"}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Link component={RouterLink} to="/login" underline="hover">
              Back to Login
            </Link>

            {otpSent && (
              <Button type="button" variant="text" onClick={handleResendOtp}>
                Resend OTP
              </Button>
            )}
          </Box>
        </Paper>
        <Hero />
      </Box>
    </div>
  );
}

export default ForgotPasswordPage;
