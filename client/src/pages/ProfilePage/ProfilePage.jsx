import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CorporateFareRoundedIcon from "@mui/icons-material/CorporateFareRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { getCurrentSubscription } from "../../services/SubscriptionService/subscriptionDetailsService";

const safe = (v) => (v ? String(v) : "Not available");

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);
  const role = (user?.role || "admin").toLowerCase();
  const isAdmin = role === "admin";
  const paymentPath =
    role === "manager"
      ? "/manager/subscription/payment"
      : role === "user"
        ? "/user/subscription/payment"
        : "/admin/subscription/payment";

  useEffect(() => {
    if (!isAdmin) {
      setCurrentPlan(null);
      return;
    }

    const fetchSubscription = async () => {
      const response = await getCurrentSubscription();
      if (response?.success) {
        const subscription = response?.data?.subscription;
        const plan = subscription?.plan;
        if (subscription && plan) {
          setCurrentPlan({
            name: plan.name,
            billing: plan.durationType === "YEAR" ? "Yearly" : "Monthly",
            amount: Number(plan.price),
            employeeLimit: plan.employmentLimit,
            durationMonths:
              plan.durationType === "YEAR" ? plan.duration * 12 : plan.duration,
          });
          return;
        }
      }
      setCurrentPlan(null);
      if (response?.message && response.status !== 404) {
        toast.error(response.message);
      }
    };

    fetchSubscription();
  }, [isAdmin]);

  const fullName = useMemo(() => {
    const first = user?.firstName || user?.first_name || "";
    const last = user?.lastName || user?.last_name || "";
    return `${first} ${last}`.trim() || user?.name || "Admin User";
  }, [user]);

  const initials = useMemo(
    () =>
      fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [fullName],
  );

  const org = user?.organization || {};
  const legal = user?.organizationLegal || user?.legal || {};
  const profile = user?.organizationProfile || user?.profile || {};

  const identityRows = [
    { label: "Full Name", value: fullName },
    { label: "Email", value: safe(user?.email) },
    { label: "Role", value: safe(user?.role || "admin") },
    { label: "Phone", value: safe(user?.contact || user?.phone) },
  ];

  const orgRows = [
    {
      label: "Organization Name",
      value: safe(profile?.organizationName || org?.name),
    },
    { label: "PAN Number", value: safe(legal?.panNumber) },
    { label: "GST Number", value: safe(legal?.gstNumber) },
    { label: "Website", value: safe(profile?.websiteUrl || profile?.website) },
    { label: "Address", value: safe(profile?.address || profile?.addressLine1) },
    { label: "Country", value: safe(profile?.country) },
  ];

  const docs = [
    { label: "PAN Certificate", url: legal?.panCertificateUrl },
    { label: "GST Certificate", url: legal?.gstCertificateUrl },
    { label: "Organization Logo", url: profile?.logoUrl },
  ];

  return (
    <div className="min-h-full bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: "1px solid #dbe4f0",
            background:
              "linear-gradient(115deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
            color: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 54, height: 54 }}>
                {initials}
              </Avatar>
              <div>
                <Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
                  {fullName}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
                  Account, subscription and organization compliance overview
                </Typography>
              </div>
            </Stack>
            {isAdmin ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate(paymentPath)}
                sx={{
                  bgcolor: "#fff",
                  color: "#0f172a",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                Manage Subscription
              </Button>
            ) : null}
          </Stack>
        </Paper>

        <div className={`grid grid-cols-1 gap-5 ${isAdmin ? "xl:grid-cols-3" : ""}`}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #dbe4f0" }}>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
              <CorporateFareRoundedIcon sx={{ color: "#1d4ed8" }} />
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                Admin and Organization Profile
              </Typography>
            </Stack>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {identityRows.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{item.value}</p>
                </div>
              ))}
              {orgRows.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </Paper>

          {isAdmin ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #dbe4f0" }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                <WorkspacePremiumRoundedIcon sx={{ color: "#d97706" }} />
                <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Current Plan
                </Typography>
              </Stack>
              {currentPlan ? (
                <>
                  <Chip
                    label={currentPlan.billing}
                    color="primary"
                    size="small"
                    sx={{ mb: 1.5 }}
                  />
                  <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#0f172a", lineHeight: 1.1 }}>
                    {currentPlan.name}
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: "#475569" }}>
                    Rs. {currentPlan.amount} / {currentPlan.billing.toLowerCase()}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: "#334155" }}>
                      Employee Limit: {currentPlan.employeeLimit}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#334155" }}>
                      Duration: {currentPlan.durationMonths} month{currentPlan.durationMonths > 1 ? "s" : ""}
                    </Typography>
                  </Stack>
                </>
              ) : (
                <>
                  <Chip label="Inactive" size="small" sx={{ mb: 1.5 }} />
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                    No active subscription
                  </Typography>
                  <Typography sx={{ mt: 0.75, color: "#475569" }}>
                    This organization has no active plan yet.
                  </Typography>
                </>
              )}
            </Paper>
          ) : null}
        </div>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #dbe4f0" }}>
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
            <DescriptionRoundedIcon sx={{ color: "#0f766e" }} />
            <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
              Compliance and Uploaded Documents
            </Typography>
          </Stack>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {docs.map((doc) => (
              <div key={doc.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{doc.label}</p>
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    View uploaded file
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-slate-900">Not uploaded</p>
                )}
              </div>
            ))}
          </div>
        </Paper>
      </div>
    </div>
  );
}
