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
import { getRequestData } from "../services/adminService";
import { toast } from "react-toastify";
import { approveRequest, rejectRequest } from "../services/adminService";

import { useSelector } from "react-redux";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const AdminRequest = () => {
  const [requestData, setRequestsData] = useState([]);

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const role = user.role;

  const fetchRequestsData = async () => {
    const response = await getRequestData();

    if (response?.success) setRequestsData(response.data);
  };

  const handleApprove = async (id) => {
    let response = await approveRequest(id);
    toast.success("Request Approved");
    fetchRequestsData();
  };

  const handleReject = async (id) => {
    await rejectRequest(id);
    toast.success("Request Rejected");
    fetchRequestsData();
  };

  useEffect(() => {
    fetchRequestsData();
  }, []);

  if (role != "admin") {
    return <h1>You don't have permission for this dashboard</h1>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Asset Requests</h1>

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
              <TableCell>Requested At</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {requestData.map((req, index) => (
              <TableRow key={req.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{req.User.email.split("@")[0]}</TableCell>

                <TableCell>{req.title}</TableCell>
                <TableCell>{req.description}</TableCell>
                <TableCell>₹{req.price}</TableCell>
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
                <TableCell align="center">
                  <div className="flex gap-2 justify-center">
                    {req.status === "pending" ? (
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
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-400 font-semibold">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminRequest;
