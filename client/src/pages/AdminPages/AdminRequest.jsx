import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
} from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRequestData } from "../../services/adminService";
import { toast } from "react-toastify";
import { approveRequest, rejectRequest } from "../../services/adminService";

import { useSelector } from "react-redux";

import { socket } from "../../socket";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const AdminRequest = () => {
  const [requestData, setRequestsData] = useState([]);

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [openRejectBox, setOpenRejectBox] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [remark, setRemark] = useState("");

  

  

  const role = user?.role;

  const fetchRequestsData = async () => {
    const response = await getRequestData();

    if (response?.success) setRequestsData(response.data);
  };

  const handleApprove = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to approve this request?",
    );

    if (!isConfirmed) return;

    try {
      const response = await approveRequest(id);

      if (response.success) {
        toast.success("Request Approved");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id, remark) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to reject this request?",
    );

    if (!isConfirmed) return;

    setOpenRejectBox(false);
    setRemark("");

    await rejectRequest(id, remark);
    toast.success("Request Rejected");
  };

  useEffect(() => {
    fetchRequestsData();

    const handleRequestUpdate = () => {
      fetchRequestsData();
    };

    socket.on("requestCreated", handleRequestUpdate);
    socket.on("requestUpdated", handleRequestUpdate);

    return () => {
      socket.off("requestCreated", handleRequestUpdate);
      socket.off("requestUpdated", handleRequestUpdate);
    };
  }, []);

  if (role != "admin") {
    return <h1>You don't have permission for this dashboard</h1>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl w-5 font-semibold mb-4">Asset Requests</h1>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>User-Email</TableCell>

              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Reviewed By</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {requestData.map((req, index) => (
              <TableRow key={req.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{req.User.email.split("@")[0]}</TableCell>

                <TableCell>{req.Asset?.title}</TableCell>

                <TableCell>{req.description}</TableCell>
                <TableCell>₹{req.Asset?.price}</TableCell>
                <TableCell>
                  <Chip
                    label={req.status}
                    color={statusColor(req.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(req.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {req?.reviewer?.role ? req.reviewer.role : "-"}
                </TableCell>
                <TableCell align="center">
                  <div className="flex gap-2 justify-center">
                    {req.User.role == "manager" ? (
                      req.status === "pending" ? (
                        req.Asset?.status === "available" ? (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => {
                                setRejectId(req.id);
                                setOpenRejectBox(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            Asset not available
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 font-semibold">-</span>
                      )
                    ) : (
                      " - "
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {openRejectBox && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Reject Request</h2>

            <textarea
              className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-400"
              rows="4"
              placeholder="Enter reject reason..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => {
                  setOpenRejectBox(false);
                  setRemark("");
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={async () => {
                  if (!remark.trim()) {
                    toast.error("Please enter reject reason");
                    return;
                  }

                  handleReject(rejectId, remark);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequest;
