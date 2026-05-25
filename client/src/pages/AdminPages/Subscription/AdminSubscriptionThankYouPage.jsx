import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Paper, Stack, Typography } from "@mui/material";

export default function AdminSubscriptionThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(10);
  const plan = location.state?.plan || null;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/admin/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-full bg-slate-100 p-4 md:p-6 flex items-center justify-center">
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #dbe4f0", maxWidth: 640, width: "100%" }}>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 30, fontWeight: 900, color: "#0f172a" }}>
            Congratulations
          </Typography>
          <Typography sx={{ color: "#475569" }}>
            Your payment was completed successfully.
          </Typography>
          {plan ? (
            <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>
              Active Plan: {plan.name} ({plan.billing}) - Rs. {plan.amount}
            </Typography>
          ) : (
            <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>
              Your subscription has been activated.
            </Typography>
          )}
          <Typography sx={{ color: "#475569" }}>
            Redirecting to home in {seconds} seconds...
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/dashboard")}
            sx={{ alignSelf: "flex-start", borderRadius: "12px", px: 3 }}
          >
            Go Home Now
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
