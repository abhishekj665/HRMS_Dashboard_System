

import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useSelector } from "react-redux";

import { toast } from "react-toastify";
import {
  createAsset,
  getAllAssets,
  deleteAsset,
  updateAsset,
} from "../../services/adminService";

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

const statusList = ["available", "not-available", "assigned", "repairing"];

const AdminAsset = () => {
  const [openForm, setOpenForm] = useState(false);
  const [assets, setAssets] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "available",
    price: "",
    totalQuantity: "",
    expiresAt: "",
  });
  const { user } = useSelector((state) => state.auth);

  if (user.role != "admin") {
    return <h1>You don't have permission for this page</h1>;
  }

  const fetchAssets = async () => {
    const res = await getAllAssets();
    
    if (res?.success) setAssets(res.data.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { title, description, category, price, totalQuantity } = formData;

    if (!title || !description || !category || !price || !totalQuantity) {
      toast.error("All required fields must be filled");
      return;
    }

    let res;

    if (isEditMode) {
      const isConfirmed = window.confirm(
        "Are you sure you want to edit this asset?"
      );

      if (!isConfirmed) return;
      res = await updateAsset(editId, formData);
    } else {
      const isConfirmed = window.confirm(
        "Are you sure you want to create this asset?"
      );

      if (!isConfirmed) return;
      res = await createAsset(formData);
    }

    if (res.success) {
      toast.success(
        isEditMode ? "Asset updated successfully" : "Asset created successfully"
      );

      setFormData({
        title: "",
        description: "",
        category: "",
        status: "available",
        price: "",
        totalQuantity: "",
        expiresAt: "",
      });

      setIsEditMode(false);
      setEditId(null);
      setOpenForm(false);
      fetchAssets();
    } else {
      toast.error(res.message);
    }
  };

  const handleRemove = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!isConfirmed) return;
    const res = await deleteAsset(id);

    if (res.success) {
      toast.success("Asset deleted successfully");
      fetchAssets();
    } else {
      toast.error(res.message);
    }
  };

  const handleEdit = (asset) => {
    setFormData({
      title: asset.title,
      description: asset.description,
      category: asset.category,
      status: asset.status,
      price: asset.price,
      totalQuantity: asset.totalQuantity,
      expiresAt: asset.expiresAt?.split("T")[0] || "",
    });

    setIsEditMode(true);
    setEditId(asset.id);
    setOpenForm(!openForm);
  };

  const handleCreateClick = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      status: "available",
      price: "",
      totalQuantity: "",
      expiresAt: "",
    });
    setOpenForm(!openForm);
  };

  return (
    <div className="max-w-full mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Asset Management</h1>

      <Button onClick={handleCreateClick}>Create Asset</Button>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenForm(false)}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {isEditMode ? "Edit Asset" : "Create Asset"}
              </h2>

              <button onClick={() => setOpenForm(false)}>
                <CancelPresentationRoundedIcon />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />

              <TextField
                label="Total Quantity"
                name="totalQuantity"
                type="number"
                value={formData.totalQuantity}
                onChange={handleChange}
              />
              <TextField
                type="date"
                name="expiresAt"
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
                value={formData.expiresAt}
                onChange={handleChange}
              />

              <TextField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />

              <TextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusList.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <TextField
              className="mt-4"
              label="Description"
              name="description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={handleChange}
            />

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenForm(false)}
              >
                Cancel
              </Button>

              <Button variant="contained" onClick={handleSubmit}>
                {isEditMode ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">All Assets</h2>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {assets.map((a, i) => (
                <TableRow key={a.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>₹{a.price}</TableCell>
                  <TableCell>{a.totalQuantity}</TableCell>
                  <TableCell>{a.availableQuantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        a.availableQuantity > 0 ? a.status : "not available"
                      }
                      size="small"
                      color={statusColor(
                        a.availableQuantity > 0 ? a.status : "not-available"
                      )}
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(a)}
                      >
                        <EditOutlinedIcon />
                      </Button>

                      <Button
                        size="small"
                        onClick={() => handleRemove(a.id)}
                        variant="outlined"
                        color="error"
                      >
                        <DeleteOutlinedIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default AdminAsset;
