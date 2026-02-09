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
  TextField,
} from "@mui/material";

import { Autocomplete } from "@mui/material";
import { createAssetRequest } from "../../services/managerService";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getRequestData, getAssetInfo } from "../../services/managerService";
import { toast } from "react-toastify";
import { approveRequest, rejectRequest } from "../../services/managerService";

import { useSelector } from "react-redux";

import { socket } from "../../socket";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const ManagerRequest = () => {
  const [requestData, setRequestsData] = useState([]);

  const { user } = useSelector((state) => state.auth);

  const [openRejectBox, setOpenRejectBox] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [remark, setRemark] = useState("");

  const [openForm, setOpenForm] = useState(false);

  const [assets, setAssets] = useState([]);

  const [formData, setFormData] = useState({
    assetId: "",
    description: "",
    title: "",
  });

  

  
  const role = user.role;

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

  const fetchAssets = async () => {
    try {
      const res = await getAssetInfo();

      if (res?.data?.assets?.success) {
        setAssets(res.data.assets.data);
      } else {
        setAssets([]);
        toast.error("Failed to load assets");
      }
    } catch (err) {
      setAssets([]);
      toast.error("Failed to load assets");
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.assetId || !formData.description) {
      toast.error("All fields required");
      return;
    }

    try {
      const res = await createAssetRequest(formData);

      if (res.success) {
        toast.success("Request created successfully");
        setFormData({ assetId: "", description: "", title: "" });
        setOpenForm(false);
        fetchRequestsData();
        socket.emit("requestCreated");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to create request");
    }
  };

  useEffect(() => {
    fetchRequestsData();
    fetchAssets();

    socket.on("requestCreated", () => {
      console.log("requestCreated");
      fetchRequestsData();
    });

    socket.on("requestUpdated", () => {
      console.log("requestUpdated");
      fetchRequestsData();
    });

    return () => {
      socket.off("requestCreated");
      socket.off("requestUpdated");
    };
  }, []);

  if (role != "manager") {
    return <h1>You don't have permission for this dashboard</h1>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-15">
        <h1 className="text-xl font-semibold">Asset Requests</h1>

        <Button
          className="w-20px]"
          variant="contained"
          onClick={() => setOpenForm(true)}
        >
          Request +
        </Button>
      </div>

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
                  {req?.reviewer?.id == user.id
                    ? "You"
                    : req?.reviewer?.role || "-"}
                </TableCell>
                <TableCell align="center">
                  <div className="flex gap-2 justify-center">
                    {req.User.role != "manager" ? (
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
                      "Your Request"
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
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenForm(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Asset Request</h2>
              <button onClick={() => setOpenForm(false)}>✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <Autocomplete
                options={assets}
                getOptionLabel={(option) => option.title || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(e, newValue) => {
                  if (!newValue) {
                    setFormData({ assetId: "", description: "", title: "" });
                    return;
                  }

                  setFormData({
                    ...formData,
                    assetId: newValue.id,
                    title: newValue.title,
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Search Asset" />
                )}
                noOptionsText="Not available"
              />

              <TextField
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenForm(false)}
              >
                Cancel
              </Button>

              <Button variant="contained" onClick={handleCreateRequest}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRequest;
