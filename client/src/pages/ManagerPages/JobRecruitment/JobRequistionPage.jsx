import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip
} from "@mui/material";

import { Stack, InputAdornment, Divider } from "@mui/material";

import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlagIcon from "@mui/icons-material/Flag";
import DescriptionIcon from "@mui/icons-material/Description";
import TableContainer from "@mui/material/TableContainer";
import { Card, CardContent, Collapse } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import { useTheme, useMediaQuery } from "@mui/material";

import {
  getAllJobRequisitions,
  updateJobRequisition,
  registerJobRequisition,
} from "../../../services/JobRecruitmentService/jobRequisitionService";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function ManagerRequisitionPage() {
  const [open, setOpen] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    id: null || undefined,
    title: "",
    employmentType: "",
    location: "",
    experienceMin: "",
    experienceMax: "",
    budgetMin: "",
    budgetMax: "",
    headCount: 1,
    priority: "",
    jobDescription: "",
  });
  const [requisitions, setRequisitions] = useState([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleEdit = (req) => {
    setForm({
      id: req.id,
      title: req.title || "",
      employmentType: req.employmentType || "",
      location: req.location || "",
      experienceMin: req.experienceMin ?? "",
      experienceMax: req.experienceMax ?? "",
      budgetMin: req.budgetMin ?? "",
      budgetMax: req.budgetMax ?? "",
      headCount: req.headCount ?? 1,
      priority: req.priority || "",
      jobDescription: req.jobDescription || "",
    });

    setOpen(true);
  };

  const initialFormState = {
    id: undefined,
    title: "",
    employmentType: "",
    location: "",
    experienceMin: "",
    experienceMax: "",
    budgetMin: "",
    budgetMax: "",
    headCount: 1,
    priority: "",
    jobDescription: "",
  };

  const handleCreate = () => {
    setForm(initialFormState);
    setOpen(true);
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchRequisitions = async () => {
    try {
      const response = await getAllJobRequisitions();
      if (response.success) {
        setRequisitions(response.data);
      } else {
        toast.info(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      let response;

      if (form.id) {
        response = await updateJobRequisition(form.id, form);
      } else {
        response = await registerJobRequisition(form);
      }

      if (response.success) {
        toast.success(response.message);
        fetchRequisitions();
        setOpen(false);
        setForm(initialFormState);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const rowGridTemplate = {
    xs: "40px 1fr 40px",
    md: "40px 2fr 1fr 140px 40px",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const Detail = ({ label, value, icon }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          mt: 0.5,
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontSize={12} fontWeight={600} color="text.secondary">
          {label}
        </Typography>

        <Typography fontSize={14}>{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h5" fontWeight={600}>
          Job Requisitions
        </Typography>

        <Button variant="contained" onClick={handleCreate}>
          Create Requisition
        </Button>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: rowGridTemplate.md,
          alignItems: "center",
          px: 3,
          py: 1.5,
          borderBottom: "2px solid #e0e0e0",
          fontWeight: 600,
          fontSize: 14,
          color: "#555",
        }}
      >
        <Typography>#</Typography>
        <Typography>Role</Typography>
        <Typography>Location</Typography>
        <Typography>Status</Typography>
        <Box />{" "}
      </Box>

      <Box mt={3}>
        {requisitions.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={6}
            color={"#555"}
            sx={{ opacity: 0.7 }}
          >
            <Typography fontSize={16} fontWeight={500}>
              No requisitions found
            </Typography>
          </Box>
        ) : (
          requisitions.map((req, index) => (
            <Card
              key={req.id}
              color={"#555"}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                transition: "all 0.25s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent color={"#555"} sx={{ p: 0 }}>
                <Box
                  onClick={() =>
                    setExpandedId(expandedId === req.id ? null : req.id)
                  }
                  sx={{
                    display: "grid",
                    gridTemplateColumns: rowGridTemplate,
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    cursor: "pointer",
                  }}
                >
                  {/* Index */}
                  <Typography fontWeight={600}>{index + 1}</Typography>

                  {/* Role */}
                  <Typography fontWeight={500}>{req.title}</Typography>

                  <Typography
                    sx={{ display: { xs: "none", md: "block" } }}
                    color="text.secondary"
                  >
                    {req.location}
                  </Typography>

                  <Box sx={{ display: { xs: "none", md: "flex" } }}>
                    <Chip
                      label={req.status}
                      color={getStatusColor(req.status)}
                      size="small"
                    />
                  </Box>

                  {/* Expand Icon */}
                  <ExpandMoreIcon
                    sx={{
                      justifySelf: "center",
                      transition: "transform 0.3s ease",
                      transform:
                        expandedId === req.id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  />
                </Box>

                {/* EXPANDED SECTION */}
                <Collapse in={expandedId === req.id} timeout="auto">
                  <Box
                    sx={{
                      px: 4,
                      py: 3,
                      backgroundColor: "#fafafa",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    {/* DETAILS GRID */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "1fr 1fr 1fr",
                        },
                        gap: 3,
                      }}
                    >
                      <Detail
                        label="Employment Type"
                        value={req.employmentType}
                        icon={<WorkOutlineIcon fontSize="small" />}
                      />

                      <Detail
                        label="Location"
                        value={req.location}
                        icon={<LocationOnIcon fontSize="small" />}
                      />

                      <Detail
                        label="Status"
                        value={req.status}
                        icon={<InfoOutlinedIcon fontSize="small" />}
                      />

                      <Detail
                        label="Experience"
                        value={`${req.experienceMin} - ${req.experienceMax} years`}
                        icon={<TrendingUpIcon fontSize="small" />}
                      />

                      <Detail
                        label="Budget"
                        value={`₹${req.budgetMin} - ₹${req.budgetMax}`}
                        icon={<AttachMoneyIcon fontSize="small" />}
                      />

                      <Detail
                        label="Head Count"
                        value={req.headCount}
                        icon={<GroupsIcon fontSize="small" />}
                      />

                      <Detail
                        label="Priority"
                        value={req.priority}
                        icon={<FlagIcon fontSize="small" />}
                      />

                      {req.approvedAt && (
                        <Detail
                          label="Approved On"
                          value={new Date(req.approvedAt).toLocaleDateString()}
                          icon={<EventAvailableIcon fontSize="small" />}
                        />
                      )}

                      {req.remark && (
                        <Detail
                          label="Admin Remark"
                          value={req.remark}
                          icon={<InfoOutlinedIcon fontSize="small" />}
                        />
                      )}
                    </Box>

                    <Box mt={4}>
                      <Typography fontWeight={600} mb={1}>
                        Job Description
                      </Typography>

                      <Typography color="text.secondary">
                        {req.jobDescription}
                      </Typography>
                    </Box>

                    {req.status !== "APPROVED" && (
                      <Box mt={3}>
                        <Button
                          disabled={req.status === "APPROVED"}
                          variant="contained"
                          size="small"
                          onClick={() => {
                            handleEdit(req);
                          }}
                        >
                          Edit Requisition
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* CREATE DIALOG */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {form.id ? "Edit Job Requisition" : "Create Job Requisition"}
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: { xs: 2, sm: 4 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={4}>
            {/* BASIC INFO */}
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Basic Information
              </Typography>

              <TextField
                label="Job Title"
                name="title"
                fullWidth
                required
                value={form.title || ""}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkOutlineIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Employment Type"
                name="employmentType"
                value={form.employmentType}
                fullWidth
                required
                onChange={handleChange}
              >
                <MenuItem value="FULLTIME">Full Time</MenuItem>
                <MenuItem value="INTERN">Intern</MenuItem>
                <MenuItem value="PARTTIME">Part Time</MenuItem>
                <MenuItem value="CONTRACT">Contract</MenuItem>
              </TextField>

              <TextField
                label="Location"
                name="location"
                fullWidth
                required
                value={form.location || ""}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Divider />

            {/* EXPERIENCE & BUDGET */}
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Experience & Budget
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "column", md: "row" }}
                spacing={2}
              >
                <TextField
                  label="Min Experience"
                  name="experienceMin"
                  type="number"
                  fullWidth
                  value={form.experienceMin || ""}
                  required
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TrendingUpIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Max Experience"
                  name="experienceMax"
                  value={form.experienceMax || ""}
                  type="number"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Min Budget"
                  name="budgetMin"
                  type="number"
                  value={form.budgetMin || ""}
                  fullWidth
                  required
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Max Budget"
                  name="budgetMax"
                  type="number"
                  value={form.budgetMax || ""}
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="No. of posts"
                  name="headCount"
                  type="number"
                  value={form.headCount || ""}
                  fullWidth
                  required
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  select
                  label="Priority"
                  name="priority"
                  fullWidth
                  required
                  value={form.priority || ""}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlagIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </TextField>
              </Stack>
            </Stack>

            <Divider />

            {/* DESCRIPTION */}
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Job Description
              </Typography>

              <TextField
                label="Description"
                name="jobDescription"
                value={form.jobDescription || ""}
                multiline
                rows={5}
                fullWidth
                required
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 4 },
            py: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {form.id ? "Update Requisition" : "Submit Requisition"}
          </Button>
        </DialogActions>
      </Dialog>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreate}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          boxShadow: 3,
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
