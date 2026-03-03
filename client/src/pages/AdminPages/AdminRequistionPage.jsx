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
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FlagIcon from "@mui/icons-material/Flag";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  getAllJobRequisitions,
  approveJobRequisition,
  rejectJobRequisition,
} from "../../services/CareersService/jobRequisitionService";

import { toast } from "react-toastify";

export default function AdminRequisitionPage() {
  const [requisitions, setRequisitions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [remark, setRemark] = useState("");

  const fetchData = async () => {
    const res = await getAllJobRequisitions();
    if (res.success) setRequisitions(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    const res = await approveJobRequisition(id);
    if (res.success) {
      toast.success("Requisition Approved");
      fetchData();
    }
  };

  const handleReject = async () => {
    if (!remark.trim()) {
      toast.error("Remark is required");
      return;
    }

    const res = await rejectJobRequisition(selectedId, { remark });

    if (res.success) {
      toast.success("Requisition Rejected");
      setRejectDialog(false);
      setRemark("");
      fetchData();
    }
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

  const rowGridTemplate = {
    xs: "40px 1fr auto",
    md: "40px 2fr 1fr 140px 150px 40px",
  };

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

  const getEmailUsername = (email) => {
    if (!email) return "Unknown";
    return email.split("@")[0];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight={600} mb={4}>
        Requisition Requests
      </Typography>

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
        <Typography>Created By</Typography>
        <Box /> 
      </Box>

      {requisitions.map((req, index) => (
        <Card
          key={req.id}
          sx={{
            mb: 2,
            borderRadius: 2,
            transition: "all 0.25s ease",
            "&:hover": {
              boxShadow: 3,
              transform: "translateY(-2px)",
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* SUMMARY ROW */}
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
              <Typography fontWeight={600}>{index + 1}</Typography>

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

              <Typography
                sx={{ display: { xs: "none", md: "block" } }}
                color="text.secondary"
              >
                {getEmailUsername(req.creator.email)}
              </Typography>

              <ExpandMoreIcon
                sx={{
                  transition: "transform 0.3s ease",
                  transform:
                    expandedId === req.id ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Box>

            {/* COLLAPSE SECTION */}
            <Collapse in={expandedId === req.id}>
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  flexDirection: "column",
                  gap: 1,
                  mb: 2,
                  marginX: 3,
                }}
              >
                <Typography color="text.secondary">
                  Status: {req.status}
                </Typography>

                <Typography color="text.secondary">
                  Created By: {getEmailUsername(req.creator.email)}
                </Typography>
              </Box>
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

                {/* DESCRIPTION */}
                <Box mt={4}>
                  <Typography fontWeight={600} mb={1}>
                    Job Description
                  </Typography>

                  <Typography color="text.secondary">
                    {req.jobDescription}
                  </Typography>
                </Box>

                {/* ACTION BUTTONS */}
                <Box mt={3} display="flex" gap={2}>
                  {req.status === "PENDING" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setSelectedId(req.id);
                          setRejectDialog(true);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* REJECT DIALOG */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
        <DialogTitle>Reject Requisition</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter Remark"
            fullWidth
            multiline
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
