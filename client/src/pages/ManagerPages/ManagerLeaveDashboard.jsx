import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAllUserLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../../services/ManagerService/leaveService";

export default function ManagerLeaveDashboard() {
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [remark, setRemark] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataFilter, setDataFilter] = useState("all");
  const [totalPages, setTotalPages] = useState(1);

  const [leaves, setLeaves] = useState([]);

  const getLeaves = async () => {
    try {
      let status;

      if (tab === 0) {
        status = dataFilter === "all" ? "all" : dataFilter.toUpperCase();
      } else {
        status =
          statusFilter === "all" ? "PENDING" : statusFilter.toUpperCase();
      }

      const response = await getAllUserLeaveRequests({
        page,
        limit: 10,
        status,
      });

      if (response.success) {
        const formatted = response.data.map((item) => ({
          id: item.id,
          userName: item.employee?.first_name || item.employee?.email || "N/A",
          leaveType: item.LeaveType?.name || "N/A",
          startDate: new Date(item.startDate).toLocaleDateString(),
          endDate: new Date(item.endDate).toLocaleDateString(),
          appliedOn: new Date(item.createdAt).toLocaleDateString(),
          daysRequested: item.daysRequested,
          reason: item.reason,
          status: item.status.toLowerCase(),
        }));

        setLeaves(formatted);
        setTotalPages(response.totalPages);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApprove = async (id) => {
    try {
      const response = await approveLeaveRequest(id);

      if (response.success) {
        toast.success(response.message);
        getLeaves();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkAction = (type) => {
    console.log("Bulk", type, selected);
    setSelected([]);
  };

  const handleRejectOpen = (id) => {
    setRejectId(id);
    setRejectDialog(true);
  };

  const handleRejectSubmit = async () => {
    if (!remark.trim()) {
      toast.error("Remark is required");
      return;
    }

    try {
      let response;

      if (rejectId === "bulk") {
        const promises = selected.map((id) => rejectLeaveRequest(id, remark));

        await Promise.all(promises);

        toast.success("Selected requests rejected");
        setSelected([]);
      } else {
        response = await rejectLeaveRequest(rejectId, remark);

        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      }

      getLeaves();
      setExpandedId(null);
    } catch (error) {
      toast.error(error.message);
    }

    setRejectDialog(false);
    setRemark("");
  };

  const filteredLeaves =
    tab === 0
      ? leaves.filter((l) =>
          dataFilter === "all"
            ? l.status !== "pending"
            : l.status === dataFilter,
        )
      : leaves.filter((l) =>
          statusFilter === "all"
            ? l.status === "pending"
            : l.status === statusFilter,
        );

  useEffect(() => {
    setExpandedId(null);
    setSelected([]);
    setPage(1);
  }, [tab]);

  useEffect(() => {
    getLeaves();
  }, []);

  useEffect(() => {
    getLeaves();
  }, [page, tab, statusFilter, dataFilter]);

  return (
    <Box p={1}>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Leave Data" />
        <Tab label="Leave Requests" />
      </Tabs>

      {tab === 1 && selected.length > 0 && (
        <Box
          mt={2}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          gap={1}
        >
          <Typography>{selected.length} selected</Typography>

          <Box>
            <Button
              variant="contained"
              color="success"
              sx={{ mr: 1 }}
              onClick={() => handleBulkAction("approve")}
            >
              Accept All
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => handleRejectOpen("bulk")}
            >
              Reject All
            </Button>
          </Box>
        </Box>
      )}

      {tab === 0 && (
        <Box
          mb={2}
          display="flex"
          sx={{ marginTop: "10px" }}
          justifyContent="flex-end"
        >
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={dataFilter}
              label="Status"
              onChange={(e) => setDataFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {/* COLUMN HEADER */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          px: 2,
          py: 1,
          borderBottom: "2px solid #e0e0e0",
          fontWeight: 600,
          fontSize: 14,
          color: "#555",
        }}
      >
        {tab === 1 ? (
          <>
            <Typography sx={{ width: "5%" }}>✓</Typography>
            <Typography sx={{ width: "5%" }}>Sr.</Typography>
          </>
        ) : (
          <Typography sx={{ width: "5%" }}>Sr.</Typography>
        )}

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ width: "20%" }}>Employee Name</Typography>
          <Typography sx={{ width: "20%" }}>Leave Type</Typography>
          <Typography sx={{ width: "15%" }}>From</Typography>
          <Typography sx={{ width: "15%" }}>To</Typography>
          <Typography sx={{ width: "15%" }}>Status</Typography>
        </Box>
      </Box>

      <Box mt={3}>
        {filteredLeaves.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={6}
            sx={{ opacity: 0.7 }}
          >
            <Typography fontSize={16} fontWeight={500}>
              {tab === 0
                ? "No leave history found"
                : "No pending leave requests"}
            </Typography>
          </Box>
        ) : (
          filteredLeaves.map((leave, index) => (
            <Card
              key={leave.id}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                px: { xs: 1, md: 0 },
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* SUMMARY ROW */}
                <Box
                  onClick={() => handleExpand(leave.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                  }}
                >
                  {tab === 1 && leave.status === "pending" && (
                    <Checkbox
                      size="small"
                      checked={selected.includes(leave.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleSelect(leave.id)}
                      sx={{ width: "5%" }}
                    />
                  )}

                  <Typography sx={{ width: "5%",marginRight: "10px", fontWeight: 600 }}>
                    {(page - 1) * 10 + index + 1}
                  </Typography>

                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: { xs: 0.5, md: 0 },
                    }}
                  >
                    <Box sx={{ width: { xs: "100%", md: "20%" } }}>
                      <Typography
                        sx={{
                          display: { xs: "block", md: "none" },
                          fontSize: 12,
                          color: "#666",
                          fontWeight: 600,
                        }}
                      >
                        Employee Name
                      </Typography>

                      <Typography sx={{ fontWeight: 500 }}>
                        {leave.userName.split("@")[0]}
                      </Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", md: "20%" } }}>
                      <Typography
                        sx={{
                          display: { xs: "block", md: "none" },
                          fontSize: 12,
                          color: "#666",
                          fontWeight: 600,
                        }}
                      >
                        Leave Type
                      </Typography>

                      <Typography>{leave.leaveType}</Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", md: "15%" } }}>
                      <Typography
                        sx={{
                          display: { xs: "block", md: "none" },
                          fontSize: 12,
                          color: "#666",
                          fontWeight: 600,
                        }}
                      >
                        From
                      </Typography>

                      <Typography>{leave.startDate}</Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", md: "15%" } }}>
                      <Typography
                        sx={{
                          display: { xs: "block", md: "none" },
                          fontSize: 12,
                          color: "#666",
                          fontWeight: 600,
                        }}
                      >
                        To
                      </Typography>

                      <Typography>{leave.endDate}</Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", md: "15%" } }}>
                      <Typography
                        sx={{
                          display: { xs: "block", md: "none" },
                          fontSize: 12,
                          color: "#666",
                          fontWeight: 600,
                        }}
                      >
                        Status
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          textTransform: "capitalize",
                          color:
                            leave.status === "approved"
                              ? "#2e7d32"
                              : leave.status === "rejected"
                                ? "#d32f2f"
                                : "#ed6c02",
                        }}
                      >
                        {leave.status}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* EXPANDED SECTION */}
                <Collapse in={expandedId === leave.id}>
                  <Box sx={{ px: 3, py: 2, borderTop: "1px solid #eee" }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography fontWeight={600} fontSize={13}>
                          Applied On
                        </Typography>
                        <Typography fontSize={14}>{leave.appliedOn}</Typography>
                      </Box>

                      <Box>
                        <Typography fontWeight={600} fontSize={13}>
                          Total Days
                        </Typography>
                        <Typography fontSize={14}>
                          {leave.daysRequested} Days
                        </Typography>
                      </Box>

                      <Box>
                        <Typography fontWeight={600} fontSize={13}>
                          Status
                        </Typography>
                        <Typography fontSize={14}>{leave.status}</Typography>
                      </Box>

                      <Box sx={{ gridColumn: "1 / span 3" }}>
                        <Typography fontWeight={600} fontSize={13}>
                          Reason
                        </Typography>
                        <Typography fontSize={14}>{leave.reason}</Typography>
                      </Box>
                    </Box>

                    {tab === 1 && leave.status === "pending" && (
                      <Box mt={2} display="flex" gap={2}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleApprove(leave.id)}
                        >
                          Accept
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleRejectOpen(leave.id)}
                        >
                          Reject
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

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
        <DialogTitle>Reject Leave</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Enter Remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleRejectSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
