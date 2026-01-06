import { useState } from "react";
import { Card, CardContent, Button, TextField } from "@mui/material";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import { createAssetRequest, getAssetRequest } from "../services/userService";
import { useEffect } from "react";
import { toast } from "react-toastify";

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

export default function UserAssetPage() {
  const [openForm, setOpenForm] = useState(false);
  const [requests, setRequests] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("hello");
    if (!formData.title || !formData.description || !formData.price) return;

    try {
      let response = await createAssetRequest(formData);
      if (response) {
        toast.success("Request Created Successfully");
        fetchRequest();
      }
    } catch (error) {
      toast.error(error.message);
    }

    setFormData({ title: "", description: "", price: "" });
    setOpenForm(false);
  };

  const fetchRequest = async () => {
    try {
      const response = await getAssetRequest();

      if (!response.success) {
        toast.error(response.message || "Failed to fetch requests");
        return;
      }
      console.log(response.data);
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
  }, [getAssetRequest]);

  return (
    <div className="max-w-full mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Asset Requests
      </h1>
      <Button onClick={handleOpenForm}>Create a Request</Button>

      {openForm && (
        <div className="mt-8 p-5 border rounded-xl bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Asset Request</h2>
            <Button onClick={handleOpenForm}>
              <CancelPresentationRoundedIcon />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <TextField
              label="Title"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
            />

            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />

            <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="contained" onClick={() => handleSubmit()}>
              Submit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

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
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {requests.map((req, index) => (
                  <TableRow key={req.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>{req.title}</TableCell>
                    <TableCell>{req.description}</TableCell>
                    <TableCell>₹{req.price}</TableCell>

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
}
