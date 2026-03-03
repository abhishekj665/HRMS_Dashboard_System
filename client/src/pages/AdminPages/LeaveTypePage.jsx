import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

import { getLeaveTypes } from "../../services/LMS/lmsService";
import { registerLeaveType } from "../../services/LMS/lmsService";
import { toast } from "react-toastify";

const LeaveTypePage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    isPaid: false,
    requiresApproval: false,
    isActive: true,
  });

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await getLeaveTypes();
      setLeaveTypes(res.data);
    } catch (err) {
      console.error("Error fetching leave types", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    try {
      const response = await registerLeaveType(formData);
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          code: "",
          isPaid: false,
          requiresApproval: false,
          isActive: true,
        });
        fetchLeaveTypes();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Error registering leave type", err);
    }
  };

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5">Leave Types</Typography>
            <Button
              variant="contained"
              className=""
              onClick={() => setOpen(true)}
            >
              Register New
            </Button>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Requires Approval</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={25} />
                    </TableCell>
                  </TableRow>
                ) : leaveTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No Leave Types Found
                    </TableCell>
                  </TableRow>
                ) : (
                  leaveTypes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {item.isPaid ? (
                          <Chip label="Paid" color="success" size="small" />
                        ) : (
                          <Chip label="Unpaid" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {item.requiresApproval ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Chip label="Active" color="success" size="small" />
                        ) : (
                          <Chip label="Inactive" color="error" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>


      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Register Leave Type</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPaid}
                  onChange={handleSwitchChange}
                  name="isPaid"
                />
              }
              label="Is Paid Leave"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresApproval}
                  onChange={handleSwitchChange}
                  name="requiresApproval"
                />
              }
              label="Requires Approval"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                  name="isActive"
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveTypePage;
