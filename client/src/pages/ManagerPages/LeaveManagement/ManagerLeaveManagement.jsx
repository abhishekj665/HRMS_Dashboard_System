import { useEffect, useState } from "react";
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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { useTheme, useMediaQuery } from "@mui/material";

import {
  getLeaveRequests,
  registerLeaveRequest,
  getLeaveBalance,
} from "../../../services/ManagerService/leaveService";
import { getLeaveTypes } from "../../../services/LMS/lmsService";

import { toast } from "react-toastify";


const PRIMARY = "#1a56db";
const PRIMARY_SOFT = "#e8f0fe";
const PAGE_BG = "#ffffff";
const BORDER = "#e6eaf2";
const TEXT_MUTED = "#6b7280";

const cardSx = {
  backgroundColor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 3,
};

const STATUS_STYLES = {
  APPROVED: { color: "#2e7d32", bg: "#e8f5e9" },
  REJECTED: { color: "#c62828", bg: "#fdecea" },
  PENDING: { color: "#ed6c02", bg: "#fff4e5" },
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <Box
    sx={{
      ...cardSx,
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        backgroundColor: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: TEXT_MUTED, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

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
  const hasAvailableLeave = totalAvailable > 0;

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
        getLeaveBalanceData();
        setFormData({
          leaveTypeId: "",
          startDate: "",
          endDate: "",
          isHalfDay: false,
          reason: "",
        });
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

  const availableTooltip = (
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
  );

  return (
    <Box sx={{ backgroundColor: PAGE_BG, p: { xs: 2, md: 3 }, minHeight: "100%" }}>
      {/* ---------- Page header ---------- */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#111827" }}>
            Leave Management
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_MUTED, mt: 0.5 }}>
            Apply for leave and track your requests
          </Typography>
          {!hasAvailableLeave && (
            <Typography variant="body2" sx={{ mt: 1, color: "#ed6c02" }}>
              Apply leave is disabled because no leave balance is available.
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          disabled={!hasAvailableLeave}
          sx={{
            backgroundColor: PRIMARY,
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#1648b8", boxShadow: "none" },
          }}
        >
          Apply For Leave
        </Button>
      </Box>

      {/* ---------- Stats ---------- */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        <StatCard
          label="Total Leave"
          value={totalAllocated}
          icon={<CalendarMonthOutlinedIcon fontSize="small" />}
          color={PRIMARY}
          bg={PRIMARY_SOFT}
        />

        <StatCard
          label="Used Leave"
          value={totalUsed}
          icon={<EventBusyOutlinedIcon fontSize="small" />}
          color="#7c3aed"
          bg="#f1eafe"
        />

        <Tooltip arrow placement="bottom" title={availableTooltip}>
          <Box sx={{ cursor: "default" }}>
            <StatCard
              label="Available Leave"
              value={totalAvailable}
              icon={<EventAvailableOutlinedIcon fontSize="small" />}
              color="#0f766e"
              bg="#e0f5f2"
            />
          </Box>
        </Tooltip>

        <StatCard
          label="Requested Leave"
          value={pendingCount}
          icon={<HourglassEmptyOutlinedIcon fontSize="small" />}
          color="#ed6c02"
          bg="#fff4e5"
        />

        <StatCard
          label="Approved"
          value={approvedCount}
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          color="#2e7d32"
          bg="#e8f5e9"
        />

        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon={<HighlightOffOutlinedIcon fontSize="small" />}
          color="#c62828"
          bg="#fdecea"
        />
      </Box>

      {/* ---------- Requests list ---------- */}
      <Box sx={{ ...cardSx, mt: 3, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>Leave Requests</Typography>
        </Box>
        <Divider />

        {leaveRequests.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6">No Leave Applications Found</Typography>
            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
              There are no leave applications records to display.
            </Typography>
          </Box>
        ) : (
          leaveRequests.map((leave, index) => {
            const statusStyle =
              STATUS_STYLES[leave.status] || STATUS_STYLES.PENDING;

            return (
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
                  px: 3,
                  py: 2,
                  borderBottom:
                    index === leaveRequests.length - 1
                      ? "none"
                      : `1px solid ${BORDER}`,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f8faff" },
                }}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {new Date(leave.startDate).toLocaleDateString()} -{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                    {leave.reason}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                    {leave.daysRequested} Days
                  </Typography>

                  <Chip
                    label={leave.status}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "12px",
                      color: statusStyle.color,
                      backgroundColor: statusStyle.bg,
                    }}
                  />
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* ---------- Apply dialog ---------- */}
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
            disabled={!hasAvailableLeave}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              backgroundColor: PRIMARY,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#1648b8", boxShadow: "none" },
            }}
            onClick={() => handleSubmit()}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Details dialog ---------- */}
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

      {/* ---------- Available leave dialog ---------- */}
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