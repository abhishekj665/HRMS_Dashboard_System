import { useState } from "react";
import { Button, TextField } from "@mui/material";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import {
  createAssetRequest,
  getAssetRequest,
  getAssetInfo,
} from "../../services/userService";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Autocomplete } from "@mui/material";

import { socket } from "../../socket";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";

const statusColor = (status) => {
  switch (status) {
    case "available":
      return "success";
    case "assigned":
      return "primary";
    case "repairing":
      return "warning";
    case "not-available":
      return "error";
    default:
      return "default";
  }
};

export default function UserAssetPage() {
  const [openForm, setOpenForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  

  const [formData, setFormData] = useState({
    assetId: "",
    description: "",
    quantity: 1,
    title: "",
  });

  const fetchAssets = async () => {
    const response = await getAssetInfo();

    if (response?.success) {
      setAssets(response.data.assets.data);
    } else {
      setAssets([]);
      toast.error("Failed to load assets");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.assetId || !formData.description) {
      toast.error("All field required to fill");
      return;
    }

    try {
      let response = await createAssetRequest(formData);
      if (response) {
        localStorage.setItem("ASSET_UPDATED", Date.now().toString());
        toast.success("Request Created Successfully");

        fetchRequest();
      }
    } catch (error) {
      toast.error(error.message);
    }

    setFormData({ assetId: "", description: "", title: "" });
    setOpenForm(false);
  };

  const fetchRequest = async () => {
    try {
      const response = await getAssetRequest();

      if (!response.success) {
        toast.error(response.message || "Failed to fetch requests");
        return;
      }
      
      setRequests(response.data.requestData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenForm = () => {
    setOpenForm(!openForm);
  };

  useEffect(() => {
    fetchRequest();
    fetchAssets();

    const handleRequestUpdated = () => {
      fetchRequest();
    };

    socket.on("requestUpdated", handleRequestUpdated);

    return () => {
      socket.off("requestUpdated", handleRequestUpdated);
    };
  }, []);

  return (
    <div className="max-w-full mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Asset Requests
      </h1>
      <Button onClick={handleOpenForm}>Create a Request</Button>

      {requests.length > 0 && (
        <div className="mt-10 p-6 ">
          <h2 className="text-xl font-semibold mb-4">Your Requests</h2>

          <TableContainer className="w-full" component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Title</TableCell>

                  <TableCell>Description</TableCell>

                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Asset Status</TableCell>
                  <TableCell>Remark</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {requests.map((req, index) => (
                  <TableRow key={req.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{req.title ? req.title : "-"}</TableCell>

                    <TableCell>{req.description}</TableCell>

                    <TableCell>
                      <Chip
                        label={req.status}
                        color={
                          req.status === "approved"
                            ? "success"
                            : req.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          req.Asset && req.Asset.availableQuantity > 0
                            ? req.Asset.status
                            : "not-available"
                        }
                        size="small"
                        color={statusColor(
                          req.Asset && req.Asset.availableQuantity > 0
                            ? req.Asset.status
                            : "not-available"
                        )}
                        sx={{ textTransform: "capitalize", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {req.adminRemark ? req.adminRemark : "Not Response Yet"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleOpenForm}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Asset Request</h2>
              <button onClick={handleOpenForm}>
                <CancelPresentationRoundedIcon />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Autocomplete
                options={assets}
                getOptionLabel={(option) => option.title || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  if (!newValue) {
                    setFormData({ ...formData, assetId: "", title: "" });
                    return;
                  }

                  setFormData({
                    ...formData,
                    assetId: newValue.id,
                    title: newValue.title,
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Asset"
                    placeholder="Type to search asset..."
                  />
                )}
                noOptionsText="Not available"
              />

              <TextField
                label="Description"
                name="description"
                multiline
                rows={3}
                fullWidth
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outlined" color="error" onClick={handleOpenForm}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
