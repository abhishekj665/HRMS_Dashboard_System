import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CorporateFareRoundedIcon from "@mui/icons-material/CorporateFareRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { getCurrentSubscription } from "../../services/SubscriptionService/subscriptionDetailsService";
import { getMyProfile, updateMyProfile, uploadProfileDocuments } from "../../services/Profile/profileService";

const safe = (v) => (v ? String(v) : "Not available");

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    contact: "",
    address: "",
    pincode: "",
    country: "",
    state: "",
    city: "",
    age: "",
    profileUrl: "",
    adharUrl: "",
    panCardUrl: "",
    adharNumber: "",
    panNumber: "",
    accountNumber: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState({});
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

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      const response = await getMyProfile();
      if (response?.success) {
        const nextProfile = {
          ...profileData,
          ...(response?.data?.user?.profile || {}),
        };
        setProfileData(nextProfile);
        setDraftProfile(nextProfile);
      } else {
        toast.error(response?.message || "Failed to fetch profile");
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, []);

  const fullName =
    `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";

  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const org = user?.organization || {};
  const legal = user?.organizationLegal || user?.legal || {};
  const profile = user?.organizationProfile || user?.profile || {};

  const identityRows = [
    { label: "Full Name", value: fullName },
    { label: "Email", value: safe(user?.email) },
    { label: "Role", value: safe(user?.role || "admin") },
    { label: "Phone", value: safe(profileData?.contact || user?.contact || user?.phone) },
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
  ].filter((item) => item.value !== "Not available");

  const docs = [
    { key: "profileFile", field: "profileUrl", label: "Profile Image", url: profileData?.profileUrl },
    { key: "adharFile", field: "adharUrl", label: "Aadhar Document", url: profileData?.adharUrl },
    { key: "panCardFile", field: "panCardUrl", label: "PAN Document", url: profileData?.panCardUrl },
  ];

  const profileFields = [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "contact", label: "Contact" },
    { key: "age", label: "Age" },
    { key: "address", label: "Address" },
    { key: "pincode", label: "Pincode" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "city", label: "City" },
    { key: "adharNumber", label: "Aadhar Number" },
    { key: "panNumber", label: "PAN Number" },
    { key: "accountNumber", label: "Account Number" },
  ];

  const handleEditProfile = () => {
    setDraftProfile(profileData);
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setDraftProfile(profileData);
    setIsEditingProfile(false);
  };

  const handleDraftChange = (key, value) => {
    setDraftProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const response = await updateMyProfile(draftProfile);
    if (response?.success) {
      const latestProfile = response?.data?.user?.profile || {};
      setProfileData((prev) => ({ ...prev, ...latestProfile }));
      setDraftProfile((prev) => ({ ...prev, ...latestProfile }));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error(response?.message || "Failed to update profile");
    }
    setSaving(false);
  };

  const handleDocumentUpload = async (fileKey, file) => {
    if (!file) return;
    setUploadingDoc(fileKey);
    const formData = new FormData();
    formData.append(fileKey, file);
    const response = await uploadProfileDocuments(formData);
    if (response?.success) {
      const latestProfile = response?.data?.user?.profile || {};
      setProfileData((prev) => ({ ...prev, ...latestProfile }));
      setDraftProfile((prev) => ({ ...prev, ...latestProfile }));
      toast.success("Document updated successfully");
    } else {
      toast.error(response?.message || "Failed to upload document");
    }
    setUploadingDoc("");
  };

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
                {profileData?.profileUrl ? (
                  <img
                    src={profileData.profileUrl}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </Avatar>
              <div>
                <Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
                  {fullName}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
                  Account, subscription and organization compliance overview
                </Typography>
                <label className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-xs font-semibold text-white hover:bg-white/30 cursor-pointer">
                  <PhotoCameraRoundedIcon sx={{ fontSize: 14 }} />
                  {uploadingDoc === "profileFile" ? "Uploading..." : "Edit Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingDoc === "profileFile"}
                    onChange={(event) => handleDocumentUpload("profileFile", event.target.files?.[0])}
                  />
                </label>
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
            <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <DescriptionRoundedIcon sx={{ color: "#0369a1" }} />
                <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Personal Profile Details
                </Typography>
              </Stack>
              {!isEditingProfile ? (
                <IconButton size="small" onClick={handleEditProfile}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={handleCancelEditProfile} disabled={saving}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profileFields.map((field) => {
                return (
                  <div key={field.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{field.label}</p>
                    {isEditingProfile ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={draftProfile[field.key] || ""}
                        onChange={(event) => handleDraftChange(field.key, event.target.value)}
                        sx={{ mt: 1 }}
                      />
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-900 break-all">
                        {safe(profileData[field.key])}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {isEditingProfile ? (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={saving || profileLoading}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Stack>
            ) : null}
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
                  <p className="mt-2 text-sm font-semibold text-green-700">Uploaded</p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-slate-900">Not uploaded</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                      View
                    </a>
                  ) : null}
                  <label className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-slate-100 cursor-pointer">
                    <UploadRoundedIcon sx={{ fontSize: 16 }} />
                    {uploadingDoc === doc.key ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={uploadingDoc === doc.key}
                      onChange={(event) => handleDocumentUpload(doc.key, event.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Paper>

      </div>
    </div>
  );
}
