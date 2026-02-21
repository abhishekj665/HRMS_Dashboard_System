import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { useTheme, useMediaQuery } from "@mui/material";

<Box
  position="relative"
  flex={1}
  textAlign="center"
  sx={{
    cursor: "pointer",
    "&:hover .available-hover-box": {
      display: "block",
    },
  }}
></Box>;
import {
  getLeaveRequests,
  registerLeaveRequest,
  getLeaveBalance,
} from "../../services/ManagerService/leaveService";
import { getLeaveTypes } from "../../services/LMS/lmsService";

import { toast } from "react-toastify";

const ManagerLeaveManagement = () => {
  const [open, setOpen] = useState(false);

  const [leaveTypes, setLeaveTypes] = useState([]);

  const [leaveRequests, setLeaveRequests] = useState([]);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [leaveBalance, setLeaveBalance] = useState([]);

  const [availableDetailOpen, setAvailableDetailOpen] = useState(false);

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    isHalfDay: false,
    reason: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  const getRequests = async () => {
    const res = await getLeaveRequests();
    console.log(res.data);
    setLeaveRequests(res.data);
  };

  const getTypes = async () => {
    const res = await getLeaveTypes();
    setLeaveTypes(res.data);
  };

  const totalAllocated = leaveBalance?.reduce(
    (sum, item) => sum + Number(item.totalAllocated || 0),
    0,
  );

  const totalUsed = leaveBalance?.reduce(
    (sum, item) => sum + Number(item.used || 0),
    0,
  );

  const totalAvailable = leaveBalance?.reduce(
    (sum, item) => sum + Number(item.balance || 0),
    0,
  );

  const pendingCount = leaveRequests?.filter(
    (leave) => leave.status === "PENDING",
  ).length;

  const approvedCount = leaveRequests?.filter(
    (leave) => leave.status === "APPROVED",
  ).length;

  const rejectedCount = leaveRequests?.filter(
    (leave) => leave.status === "REJECTED",
  ).length;

  const handleSubmit = async () => {
    try {
      const response = await registerLeaveRequest(formData);
      if (response.success) {
        setOpen(false);
        getRequests();
        toast.success(response.message);
      } else {
        console.log(response);
        toast.error(response.message);
        return;
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getRequests();
    getLeaveBalanceData();
  }, []);

  const getLeaveBalanceData = async () => {
    const res = await getLeaveBalance();
    console.log(res.data);
    setLeaveBalance(res.data);
  };

  useEffect(() => {
    getTypes();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#eef1f7", px: 2 }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f2d6c, #2e3c8f)",
          color: "#fff",
          p: 4,
          pb: 8,
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
        >
          <h1 className="text-xl font-bold  ">
            <div className="text-2xl font-medium flex italic tracking-tight">
              <p>Leave Management</p>
            </div>
          </h1>

          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: "#ffffff20",
              backdropFilter: "blur(10px)",
              textTransform: "none",
            }}
          >
            Apply For Leave
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
          py: 3,
          px: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(3, 1fr)",
            md: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        {/* TOTAL */}
        <Box textAlign="center" flex={1}>
          <Typography variant="body2" color="text.secondary">
            Total Leave
          </Typography>
          <Typography variant="h6">{totalAllocated}</Typography>
        </Box>

        <Box textAlign="center" flex={1}>
          <Typography variant="body2" color="text.secondary">
            Used Leave
          </Typography>
          <Typography variant="h6">{totalUsed}</Typography>
        </Box>

        <Tooltip
          arrow
          placement="bottom"
          title={
            <Box>
              {leaveBalance?.length === 0 ? (
                <Typography variant="body2">No leave balance data</Typography>
              ) : (
                leaveBalance?.map((item) => (
                  <Box
                    key={item.leaveTypeId}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      minWidth: 180,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.LeaveType?.name || "Unknown"}
                    </Typography>

                    <Typography variant="body2">{item.balance} Days</Typography>
                  </Box>
                ))
              )}
            </Box>
          }
        >
          <Box textAlign="center" flex={1} sx={{ cursor: "default" }}>
            <Typography variant="body2" color="text.secondary">
              Available Leave
            </Typography>

            <Typography variant="h6">{totalAvailable}</Typography>
          </Box>
        </Tooltip>

        <Box textAlign="center" flex={1}>
          <Typography variant="body2" color="text.secondary">
            Requested Leave
          </Typography>
          <Typography variant="h6">{pendingCount}</Typography>
        </Box>

        <Box textAlign="center" flex={1}>
          <Typography variant="body2" color="text.secondary">
            Approved
          </Typography>
          <Typography variant="h6">{approvedCount}</Typography>
        </Box>

        {/* REJECTED */}
        <Box textAlign="center" flex={1}>
          <Typography variant="body2" color="text.secondary">
            Rejected
          </Typography>
          <Typography variant="h6">{rejectedCount}</Typography>
        </Box>
      </Box>

      <Box maxWidth="1200px" mx="auto" mt={4}>
        {leaveRequests.length === 0 ? (
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
              py: 8,
              textAlign: "center",
            }}
          >
            <Typography variant="h6">No Leave Applications Found</Typography>
            <Typography variant="body2" color="text.secondary">
              There are no leave applications records to display.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
              p: 3,
            }}
          >
            {leaveRequests.map((leave) => (
              <Box
                key={leave.id}
                onClick={() => {
                  setSelectedLeave(leave);
                  setDetailOpen(true);
                }}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: { sm: "space-between" },
                  gap: 1,
                  py: 2,
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {new Date(leave.startDate).toLocaleDateString()} -{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {leave.reason}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  <Typography variant="body2">
                    {leave.daysRequested} Days
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      px: 2,
                      py: 0.5,
                      borderRadius: 20,
                      fontSize: "12px",
                      fontWeight: 600,
                      color:
                        leave.status === "APPROVED"
                          ? "#2e7d32"
                          : leave.status === "REJECTED"
                            ? "#c62828"
                            : "#ed6c02",
                    }}
                  >
                    {leave.status}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ fontWeight: 600 }}>Apply for Leave</DialogTitle>

          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="body2" mb={1}>
                Leave Type <span style={{ color: "red" }}>*</span>
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={formData.leaveTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, leaveTypeId: e.target.value })
                }
              >
                {leaveTypes.length === 0 ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  leaveTypes
                    .filter((type) => type.isActive)
                    .map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))
                )}
              </TextField>
            </Box>

            {/* Upload */}
            {/* <Box>
              <Typography variant="body2" mb={1}>
                Supporting Document
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  height: "40px",
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Upload supporting document
              </Button>
            </Box> */}

            {/* From Date */}
            <Box>
              <Typography variant="body2" mb={1}>
                From Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                inputProps={{
                  min: minDate.toISOString().split("T")[0],
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box>
              <Typography variant="body2" mb={1}>
                To Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                inputProps={{
                  min:
                    formData.startDate || minDate.toISOString().split("T")[0],
                }}
              />
            </Box>
          </Box>

          {/* Half Day */}
          <Box mt={3}>
            <Typography variant="body2" mb={1}>
              Half Day
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formData.isHalfDay}
                  onChange={(e) =>
                    setFormData({ ...formData, isHalfDay: e.target.checked })
                  }
                />
              }
              label="Apply Half Day Leave"
            />
          </Box>

          <Box mt={3}>
            <Typography variant="body2" mb={1}>
              Reason <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              size="small"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Please provide a reason for your leave..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
            }}
            onClick={() => handleSubmit()}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        {selectedLeave && (
          <>
            <DialogTitle sx={{ fontWeight: 600 }}>Leave Details</DialogTitle>

            <DialogContent dividers>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Leave Period
                </Typography>
                <Typography fontWeight={600}>
                  {new Date(selectedLeave.startDate).toLocaleDateString()} →{" "}
                  {new Date(selectedLeave.endDate).toLocaleDateString()}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Days Requested
                </Typography>
                <Typography fontWeight={600}>
                  {selectedLeave.daysRequested} Days
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Reason
                </Typography>
                <Typography>{selectedLeave.reason}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography fontWeight={600}>{selectedLeave.status}</Typography>
              </Box>

              {selectedLeave.remark && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Remark
                  </Typography>
                  <Typography>{selectedLeave.remark}</Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog
        open={availableDetailOpen}
        onClose={() => setAvailableDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Available Leave Details</DialogTitle>

        <DialogContent dividers>
          {leaveBalance?.length === 0 ? (
            <Typography>No leave balance data available.</Typography>
          ) : (
            leaveBalance?.map((item) => (
              <Box
                key={item.leaveTypeId}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Typography fontWeight={500}>{item.leaveType?.name}</Typography>

                <Typography>{item.balance} Days Available</Typography>
              </Box>
            ))
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAvailableDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerLeaveManagement;
