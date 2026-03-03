import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Collapse,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  MenuItem,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  getAllJobPosts,
  updateJobPost,
} from "../../services/CareersService/jobPostService";

import { toast } from "react-toastify";

export default function AdminJobPostsPage() {
  const [jobPosts, setJobPosts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    const res = await getAllJobPosts();
    if (res.success) setJobPosts(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateClick = (job) => {
    setSelectedId(job.id);
    setForm({
      title: job.title || "",
      slug: job.slug || "",
      visibility: job.visibility || "INTERNAL",
      description: job.description || "",
      isActive: job.isActive || false,
      expiresAt: job.expiresAt ? job.expiresAt.substring(0, 10) : "",
    });
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    const res = await updateJobPost(selectedId, form);
    if (res.success) {
      toast.success("Job Post Updated");
      setOpenDialog(false);
      fetchData();
    }
  };

  const getVisibilityColor = (visibility) =>
    visibility === "INTERNAL" ? "primary" : "secondary";

  const rowGridTemplate = {
    xs: "40px 1fr auto",
    md: "40px 2fr 150px 120px 40px",
  };

  const Detail = ({ label, value, icon }) => (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Box sx={{ mt: 0.5, color: "primary.main" }}>{icon}</Box>
      <Box>
        <Typography fontSize={12} fontWeight={600} color="text.secondary">
          {label}
        </Typography>
        <Typography fontSize={14}>{value || "-"}</Typography>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight={600} mb={4}>
        Job Posts
      </Typography>

      {/* HEADER */}
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: rowGridTemplate.md,
          px: 3,
          py: 1.5,
          fontWeight: 600,
          borderBottom: "2px solid #e0e0e0",
        }}
      >
        <Typography>#</Typography>
        <Typography>Title</Typography>
        <Typography>Visibility</Typography>
        <Typography>Status</Typography>
        <Box />
      </Box>

      {jobPosts.map((job, index) => (
        <Card key={job.id} sx={{ mb: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              onClick={() =>
                setExpandedId(expandedId === job.id ? null : job.id)
              }
              sx={{
                display: "grid",
                gridTemplateColumns: rowGridTemplate,
                px: 3,
                py: 2,
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <Typography>{index + 1}</Typography>

              <Typography fontWeight={500}>{job.title}</Typography>

              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <Chip
                  label={job.visibility}
                  color={getVisibilityColor(job.visibility)}
                  size="small"
                />
              </Box>

              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <Chip
                  label={job.isActive ? "Active" : "Inactive"}
                  color={job.isActive ? "success" : "default"}
                  size="small"
                />
              </Box>

              <ExpandMoreIcon
                sx={{
                  transition: "0.3s",
                  transform:
                    expandedId === job.id ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Box>

            {/* COLLAPSE */}
            <Collapse in={expandedId === job.id}>
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  backgroundColor: "#fafafa",
                  borderTop: "1px solid #eee",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 3,
                  }}
                >
                  <Detail
                    label="Title"
                    value={job.title}
                    icon={<WorkOutlineIcon fontSize="small" />}
                  />

                  <Detail
                    label="Slug"
                    value={job.slug || "Not Generated"}
                    icon={<LinkIcon fontSize="small" />}
                  />

                  <Detail
                    label="Visibility"
                    value={job.visibility}
                    icon={<VisibilityIcon fontSize="small" />}
                  />

                  <Detail
                    label="Created At"
                    value={new Date(job.createdAt).toLocaleDateString()}
                    icon={<EventAvailableIcon fontSize="small" />}
                  />

                  <Detail
                    label="Deadline"
                    value={
                      job.expiresAt
                        ? new Date(job.expiresAt) < new Date()
                          ? "Expired"
                          : new Date(job.expiresAt).toLocaleDateString()
                        : "Not Set"
                    }
                    icon={<EventAvailableIcon fontSize="small" />}
                  />

                  <Detail
                    label="Status"
                    value={job.isActive ? "Active" : "Inactive"}
                    icon={<InfoOutlinedIcon fontSize="small" />}
                  />
                </Box>

                <Box mt={4}>
                  <Typography fontWeight={600} mb={1}>
                    Job Description (JD)
                  </Typography>
                  <Typography color="text.secondary">
                    {job.description || "No description provided"}
                  </Typography>
                </Box>

                {/* UPDATE BUTTON */}
                <Box mt={3}>
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateClick(job)}
                  >
                    Update Job Post
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* UPDATE DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Update Job Post</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Job Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />

            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              fullWidth
            />

            <TextField
              select
              label="Visibility"
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              fullWidth
            >
              <MenuItem value="INTERNAL">INTERNAL</MenuItem>
              <MenuItem value="EXTERNAL">PUBLIC</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
              }
              label="Active Status"
            />

            <TextField
              label="Deadline"
              type="date"
              value={form.expiresAt || ""}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
              }}
              fullWidth
            />

            <TextField
              label="Job Description (JD)"
              multiline
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
