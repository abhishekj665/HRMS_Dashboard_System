import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Grid,
  Divider,
  Switch,
  Stack,
  FormControlLabel,
} from "@mui/material";

import { Autocomplete } from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect } from "react";

import {
  createLeavePolicy,
  updateLeavePolicy,
} from "../../../services/LMS/lmsService";
import { getLeaveTypes } from "../../../services/LMS/lmsService";

import { getLeavePolicies } from "../../../services/LMS/lmsService";

export default function LeavePolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openPolicyDetail, setOpenPolicyDetail] = useState(false);
  const [openLeaveTypeDetail, setOpenLeaveTypeDetail] = useState(false);

  const [availableLeaveTypes, setAvailableLeaveTypes] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    effectiveFrom: "",
    effectiveTo: "",
    description: "",
    appliesTo: "all",
    isActive: true,
    carryForwardEnabled: false,
    leaveTypes: [],
  });
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeaveTypeChange = (index, field, value) => {
    const updated = [...formData.leaveTypes];
    updated[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      leaveTypes: updated,
    }));
  };

  const selectedIds = formData.leaveTypes.map((l) => l.leaveTypeId);

  const addLeaveType = () => {
    setFormData((prev) => ({
      ...prev,
      leaveTypes: [
        {
          leaveTypeId: "",
          totalLeaves: "",
          maxCarryForward: "",
        },
        ...prev.leaveTypes,
      ],
    }));
  };
  const removeLeaveType = (index) => {
    const updated = [...formData.leaveTypes];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, leaveTypes: updated }));
  };

  const handleUpdatePolicy = async () => {
    try {
      const payload = {
        name: editForm.name,
        year: editForm.year,
        effectiveFrom: editForm.effectiveFrom,
        effectiveTo: editForm.effectiveTo,
        isActive: editForm.isActive,
        appliesTo: editForm.appliesTo,
        carryForwardEnabled: editForm.carryForwardEnabled,
        rules: editForm.rules.map((rule) => ({
          id: rule.id, // important for update
          leaveTypeId: rule.leaveTypeId,
          quotaPerYear: rule.quotaPerYear,
          carryForwardLimit: rule.carryForwardLimit || null,
        })),
      };

      const response = await updateLeavePolicy(editForm.id, payload);

      if (response.success) {
        await refreshPolicies();
        setIsEditMode(false);
        setOpenPolicyDetail(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const refreshPolicies = async () => {
    try {
      const response = await getLeavePolicies();
      if (response.success) {
        setPolicies(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        year: formData.year,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo,
        isActive: formData.isActive,
        carryForwardEnabled: formData.carryForwardEnabled,
        appliesTo: formData.appliesTo,
        rules: formData.leaveTypes.map((rule) => ({
          leaveTypeId: rule.leaveTypeId,
          quotaPerYear: rule.totalLeaves,
          carryForwardAllowed: formData.carryForwardEnabled,
          carryForwardLimit: rule.maxCarryForward || null,
        })),
      };

      const response = await createLeavePolicy(payload);

      if (response.success) {
        setOpenCreate(false);
        setFormData({
          name: "",
          year: new Date().getFullYear(),
          effectiveFrom: "",
          effectiveTo: "",
          description: "",
          appliesTo: "all",
          isActive: true,
          carryForwardEnabled: false,
          leaveTypes: [],
        });
        await refreshPolicies();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getLeaveTypeName = (id) => {
    const lt = availableLeaveTypes.find((l) => l.id === id);
    return lt ? `${lt.name} (${lt.code})` : "Unknown";
  };

  const handlePolicyClick = (policy) => {
    const normalized = {
      ...policy,
      rules: policy.rules?.map((r) => ({
        ...r,
        quotaPerYear: Number(r.quotaPerYear || 0),
        carryForwardLimit: r.carryForwardLimit
          ? Number(r.carryForwardLimit)
          : "",
      })),
    };

    setSelectedPolicy(normalized);
    setEditForm(normalized);
    setIsEditMode(false);
    setOpenPolicyDetail(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditLeaveTypeChange = (index, field, value) => {
    const updated = [...editForm.rules];
    updated[index][field] = value;

    setEditForm((prev) => ({
      ...prev,
      rules: updated,
    }));
  };

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await getLeaveTypes();
        if (response.success) {
          setAvailableLeaveTypes(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch leave types", error);
      }
    };

    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoadingPolicies(true);
        const response = await getLeavePolicies();
        console.log("Policies API Response:", response.data);

        if (response.success) {
          setPolicies(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch policies", error);
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, []);

  const roleOptions = [
    { label: "All", value: "all" },
    { label: "Employees", value: "employee" },
    { label: "Managers", value: "manager" },
  ];

  const selectedEditIds = editForm?.rules?.map((r) => r.leaveTypeId) || [];

  return (
    <div className="p-6  min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-semibold">
          Leave Policies
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpenCreate(true)}
          className="bg-blue-600! hover:bg-blue-700!"
        >
          Create Policy
        </Button>
      </div>

      <TableContainer component={Paper} className="shadow-md rounded-xl">
        <Table>
          <TableHead>
            <TableRow >
              <TableCell>Name</TableCell>
              <TableCell>Effective From</TableCell>
              <TableCell>Effective To</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loadingPolicies ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  hover
                  className="cursor-pointer"
                  onClick={() => handlePolicyClick(policy)}
                >
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.effectiveFrom}</TableCell>
                  <TableCell>{policy.effectiveTo}</TableCell>
                  <TableCell>{policy.year}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.isActive ? "Active" : "Inactive"}
                      color={policy.isActive ? "success" : "default"}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Leave Policy</DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={4} sx={{ marginTop: "15px" }}>
            <TextField
              label="Policy Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />

            <Stack direction="row" spacing={3}>
              <TextField
                label="Year"
                type="number"
                sx={{
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                }}
                fullWidth
                value={formData.year}
                onChange={(e) => handleFieldChange("year", e.target.value)}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleFieldChange("isActive", e.target.checked)
                    }
                  />
                }
                label="Active"
              />
            </Stack>

            <Stack direction="row" spacing={3}>
              <TextField
                type="date"
                label="Effective From"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={formData.effectiveFrom}
                onChange={(e) =>
                  handleFieldChange("effectiveFrom", e.target.value)
                }
              />

              <TextField
                type="date"
                label="Effective To"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={formData.effectiveTo}
                onChange={(e) =>
                  handleFieldChange("effectiveTo", e.target.value)
                }
              />
            </Stack>

            <Autocomplete
              options={roleOptions}
              getOptionLabel={(option) => option.label}
              value={roleOptions.find((r) => r.value === formData.appliesTo)}
              onChange={(event, newValue) => {
                handleFieldChange("appliesTo", newValue?.value || "all");
              }}
              renderInput={(params) => (
                <TextField {...params} label="Applies To" fullWidth />
              )}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.carryForwardEnabled}
                  onChange={(e) =>
                    handleFieldChange("carryForwardEnabled", e.target.checked)
                  }
                />
              }
              label="Enable Carry Forward"
            />

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontWeight={600}>Leave Types</Typography>

              <Button variant="contained" size="small" onClick={addLeaveType}>
                Add Leave Type
              </Button>
            </Stack>

            {formData.leaveTypes.length === 0 && (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No leave types added yet.
                </Typography>
              </Paper>
            )}

            <Stack spacing={3}>
              {formData.leaveTypes.map((type, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 2 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography fontWeight={600}>
                      {type.leaveTypeId
                        ? getLeaveTypeName(type.leaveTypeId)
                        : `Leave Type ${index + 1}`}
                    </Typography>

                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => removeLeaveType(index)}
                    >
                      Remove
                    </Button>
                  </Stack>

                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={3}>
                    <TextField
                      select
                      label="Select Leave Type"
                      fullWidth
                      value={type.leaveTypeId}
                      onChange={(e) =>
                        handleLeaveTypeChange(
                          index,
                          "leaveTypeId",
                          e.target.value,
                        )
                      }
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select</option>
                      {availableLeaveTypes.map((lt) => {
                        const isAlreadySelected =
                          selectedIds.includes(lt.id) &&
                          lt.id !== type.leaveTypeId;

                        return (
                          <option
                            key={lt.id}
                            value={lt.id}
                            disabled={isAlreadySelected}
                          >
                            {lt.name} ({lt.code})
                          </option>
                        );
                      })}
                    </TextField>

                    <TextField
                      label="Total Leaves / Year"
                      type="number"
                      sx={{
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                          {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        "& input[type=number]": {
                          MozAppearance: "textfield",
                        },
                      }}
                      fullWidth
                      value={type.totalLeaves}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 0) {
                          handleLeaveTypeChange(
                            index,
                            "totalLeaves",
                            e.target.value,
                          );
                        }
                      }}
                    />

                    {formData.carryForwardEnabled && (
                      <TextField
                        label="Max Carry Forward"
                        type="number"
                        sx={{
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              WebkitAppearance: "none",
                              margin: 0,
                            },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        fullWidth
                        value={type.maxCarryForward}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || Number(value) >= 0) {
                            handleLeaveTypeChange(
                              index,
                              "maxCarryForward",
                              value,
                            );
                          }
                        }}
                      />
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleSave}>
            Save Policy
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPolicyDetail}
        onClose={() => setOpenPolicyDetail(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditMode ? "Edit Leave Policy" : "Policy Details"}
        </DialogTitle>

        <DialogContent sx={{ paddingTop: "15px" }}>
          {editForm && (
            <Stack spacing={3} sx={{ marginTop: "15px" }}>
              <TextField
                label="Policy Name"
                sx={{ paddingBottom: "15px" }}
                fullWidth
                disabled={!isEditMode}
                value={editForm.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
              />

              <Stack direction="row" spacing={3}>
                <TextField
                  label="Effective From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={!isEditMode}
                  value={editForm.effectiveFrom}
                  onChange={(e) =>
                    handleEditChange("effectiveFrom", e.target.value)
                  }
                />

                <TextField
                  label="Effective To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={!isEditMode}
                  value={editForm.effectiveTo}
                  onChange={(e) =>
                    handleEditChange("effectiveTo", e.target.value)
                  }
                />
              </Stack>

              <Stack direction="row" spacing={3}>
                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  disabled={!isEditMode}
                  value={editForm.year}
                  onChange={(e) => handleEditChange("year", e.target.value)}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.isActive}
                      disabled={!isEditMode}
                      onChange={(e) =>
                        handleEditChange("isActive", e.target.checked)
                      }
                    />
                  }
                  label="Active"
                />
              </Stack>

              <Autocomplete
                options={roleOptions}
                getOptionLabel={(option) => option.label}
                disabled={true}
                value={roleOptions.find((r) => r.value === editForm.appliesTo)}
                onChange={(event, newValue) =>
                  handleEditChange("appliesTo", newValue?.value || "all")
                }
                renderInput={(params) => (
                  <TextField {...params} label="Applies To" fullWidth />
                )}
              />

              <Divider />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={600}>Leave Rules</Typography>

                {isEditMode && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setEditForm((prev) => ({
                        ...prev,
                        rules: [
                          {
                            leaveTypeId: "",
                            quotaPerYear: "",
                            carryForwardLimit: "",
                          },
                          ...prev.rules,
                        ],
                      }))
                    }
                  >
                    + Add
                  </Button>
                )}
              </Stack>

              {editForm?.rules?.map((rule, index) => (
                <Paper key={index} sx={{ p: 3, mb: 2 }}>
                  {isEditMode ? (
                    <TextField
                      select
                      label="Select Leave Type"
                      fullWidth
                      value={rule.leaveTypeId}
                      onChange={(e) =>
                        handleEditLeaveTypeChange(
                          index,
                          "leaveTypeId",
                          e.target.value,
                        )
                      }
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select</option>
                      {availableLeaveTypes.map((lt) => {
                        const isAlreadySelected =
                          selectedEditIds.includes(lt.id) &&
                          lt.id !== rule.leaveTypeId;

                        return (
                          <option
                            key={lt.id}
                            value={lt.id}
                            disabled={isAlreadySelected}
                          >
                            {lt.name} ({lt.code})
                          </option>
                        );
                      })}
                    </TextField>
                  ) : (
                    <Typography fontWeight={600}>
                      {rule.leaveType?.name} ({rule.leaveType?.code})
                    </Typography>
                  )}

                  <TextField
                    sx={{ marginTop: "15px" }}
                    label="Total Leaves / Year"
                    type="number"
                    fullWidth
                    disabled={!isEditMode}
                    value={rule.quotaPerYear}
                    onChange={(e) =>
                      handleEditLeaveTypeChange(
                        index,
                        "quotaPerYear",
                        e.target.value,
                      )
                    }
                  />

                  {editForm.carryForwardEnabled && (
                    <TextField
                      label="Max Carry Forward"
                      type="number"
                      fullWidth
                      disabled={!isEditMode}
                      value={rule.carryForwardLimit || ""}
                      onChange={(e) =>
                        handleEditLeaveTypeChange(
                          index,
                          "carryForwardLimit",
                          e.target.value,
                        )
                      }
                    />
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          {!isEditMode ? (
            <Button variant="contained" onClick={() => setIsEditMode(true)}>
              Edit
            </Button>
          ) : (
            <Button variant="contained" onClick={handleUpdatePolicy}>
              Save Changes
            </Button>
          )}

          <Button onClick={() => setOpenPolicyDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
