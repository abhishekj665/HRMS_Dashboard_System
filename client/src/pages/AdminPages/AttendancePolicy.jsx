import { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { toast } from "react-toastify";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { TableContainer } from "@mui/material";

import {
  getAttendancePolicyList,
  registerAttendancePolicy,
  updateAttendancePolicy,
  deleteAttendancePolicy,
} from "../../services/AttendanceService/attendanceService";

const weekendDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyForm = {
  shiftType: "SAMEDAY",
  isDefault: false,
  startTime: "",
  endTime: "",
  breakMinute: "",
  gracePunchInTime: "",
  gracePunchOutTime: "",
  graceHalfDayMinute: "",
  graceAbsentMinute: "",
  graceLateMinute: "",
  weekends: [],
  effectiveFrom: "",
  effectiveTo: "",
  overtimeEnable: false,
  overtimeStartTime: "",
  overtimeMinutes: "",
};

export default function AttendancePolicyAdmin() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setTime = (k, v) => update(k, v ? v.format("HH:mm") : "");
  const timeVal = (t) => (t ? dayjs(`2020-01-01T${t}`) : null);

  const toggleWeekend = (d) => {
    const s = new Set(form.weekends);
    s.has(d) ? s.delete(d) : s.add(d);
    update("weekends", [...s]);
  };

  const load = async () => {
    const r = await getAttendancePolicyList();
    if (r?.success) setRows(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    const ot = row.OvertimePolicy || {};
    setEditId(row.id);
    setForm({
      shiftType: row.shiftType,
      isDefault: row.isDefault,
      startTime: row.startTime?.slice(0, 5) || "",
      endTime: row.endTime?.slice(0, 5) || "",
      breakMinute: row.breakMinute || "",
      gracePunchInTime: row.gracePunchInTime?.slice(0, 5) || "",
      gracePunchOutTime: row.gracePunchOutTime?.slice(0, 5) || "",
      graceHalfDayMinute: row.graceHalfDayMinute || "",
      graceAbsentMinute: row.graceAbsentMinute || "",
      graceLateMinute: row.graceLateMinute || "",
      weekends: row.weekends || [],
      effectiveFrom: row.effectiveFrom || "",
      effectiveTo: row.effectiveTo || "",
      overtimeEnable: !!ot.enable,
      overtimeStartTime: ot.overtimeStartTime?.slice(0, 5) || "",
      overtimeMinutes: ot.overtimeMinutes || "",
    });
    setOpen(true);
  };

  const formatIndianDate = (d) => (d ? dayjs(d).format("DD-MM-YYYY") : "-");
  const formatTimeAMPM = (t) =>
    t ? dayjs(`2020-01-01T${t}`).format("hh:mm A") : "-";

  const save = async () => {
    const attendancePolicy = {
      shiftType: form.shiftType,
      isDefault: form.isDefault,
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinute: Number(form.breakMinute || 0),
      gracePunchInTime: form.gracePunchInTime || null,
      gracePunchOutTime: form.gracePunchOutTime || null,
      graceHalfDayMinute: Number(form.graceHalfDayMinute || 0),
      graceAbsentMinute: Number(form.graceAbsentMinute || 0),
      graceLateMinute: Number(form.graceLateMinute || 0),
      weekends: form.weekends,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
    };

    const overtimePolicy = {
      enable: form.overtimeEnable,
      overtimeStartTime: form.overtimeStartTime || null,
      overtimeMinutes: Number(form.overtimeMinutes || 0),
    };

    const res = editId
      ? await updateAttendancePolicy(
          { attendancePolicy, overtimePolicy },
          editId,
        )
      : await registerAttendancePolicy({ attendancePolicy, overtimePolicy });

    if (res?.success) {
      toast.success("Saved");
      setOpen(false);
      load();
    } else toast.error(res?.message || "Failed");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this policy?");
    if (!ok) return;

    const res = await deleteAttendancePolicy(id);

    if (res?.success) {
      toast.success("Policy deleted");
      load();
    } else {
      toast.error(res?.message || "Delete failed");
    }
  };

  return (
    <Box p={1} className="space-y-6">
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">Attendance Policies</Typography>
        <Button variant="contained" onClick={openCreate}>
          New Policy
        </Button>
      </Stack>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        sx={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table size="small" sx={{ minWidth: 1000 }}>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shift</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Break (M)</TableCell>
                  <TableCell>Grace Late(M)</TableCell>
                  <TableCell>Grace Half(M)</TableCell>
                  <TableCell>Grace Absent(M)</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Active</TableCell>

                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.shiftType}</TableCell>
                    <TableCell>{formatTimeAMPM(r.startTime)}</TableCell>
                    <TableCell>{formatTimeAMPM(r.endTime)}</TableCell>

                    <TableCell>{r.breakMinute}</TableCell>
                    <TableCell>{r.graceLateMinute}</TableCell>
                    <TableCell>{r.graceHalfDayMinute}</TableCell>
                    <TableCell>{r.graceAbsentMinute}</TableCell>
                    <TableCell>{formatIndianDate(r.effectiveFrom)}</TableCell>
                    <TableCell>{formatIndianDate(r.effectiveTo)}</TableCell>

                    <TableCell>
                      <Chip
                        label={r.isDefault ? "Yes" : "No"}
                        size="small"
                        color={r.isDefault ? "success" : "default"}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEdit(r)}
                        >
                          <EditOutlinedIcon />
                        </Button>

                        {!r.isDefault && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(r.id)}
                          >
                            <DeleteOutlinedIcon />
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Table>
      </TableContainer>

      {/* DIALOG FORM */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editId ? "Edit Policy" : "Create Policy"}</DialogTitle>
        <DialogContent className="space-y-5">
          <TextField
            select
            label="Shift Type"
            fullWidth
            value={form.shiftType}
            style={{ marginTop: "5px" }}
            onChange={(e) => update("shiftType", e.target.value)}
          >
            <MenuItem value="SAMEDAY">Same Day</MenuItem>
            <MenuItem value="OVERNIGHT">Overnight</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.isDefault}
                onChange={(e) => update("isDefault", e.target.checked)}
              />
            }
            label="Default Policy"
          />

          <Stack direction="row" gap={3}>
            <TimePicker
              label="Start"
              value={timeVal(form.startTime)}
              onChange={(v) => setTime("startTime", v)}
            />
            <TimePicker
              label="End"
              value={timeVal(form.endTime)}
              onChange={(v) => setTime("endTime", v)}
            />
          </Stack>

          <TextField
            label="Break Minutes"
            type="number"
            fullWidth
            style={{ marginBottom: "15px" }}
            value={form.breakMinute}
            onChange={(e) => update("breakMinute", e.target.value)}
          />

          <Stack direction="row" gap={3}>
            <TimePicker
              label="PunchIn Grace"
              style={{ marginTop: "5px" }}
              value={timeVal(form.gracePunchInTime)}
              onChange={(v) => setTime("gracePunchInTime", v)}
            />
            <TimePicker
              style={{ marginTop: "5px" }}
              label="PunchOut Grace"
              value={timeVal(form.gracePunchOutTime)}
              onChange={(v) => setTime("gracePunchOutTime", v)}
            />
          </Stack>

          <Stack direction="row" gap={3}>
            <TextField
              label="Late Grace"
              type="number"
              value={form.graceLateMinute}
              onChange={(e) => update("graceLateMinute", e.target.value)}
            />
            <TextField
              label="Half Day Grace"
              type="number"
              value={form.graceHalfDayMinute}
              onChange={(e) => update("graceHalfDayMinute", e.target.value)}
            />
            <TextField
              label="Absent Grace"
              type="number"
              value={form.graceAbsentMinute}
              onChange={(e) => update("graceAbsentMinute", e.target.value)}
            />
          </Stack>

          <Stack direction="row" gap={1} flexWrap="wrap">
            {weekendDays.map((d) => (
              <Chip
                key={d}
                label={d}
                onClick={() => toggleWeekend(d)}
                color={form.weekends.includes(d) ? "primary" : "default"}
                clickable
              />
            ))}
          </Stack>

          <Stack direction="row" gap={3}>
            <TextField
              type="date"
              label="Effective From"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFrom}
              onChange={(e) => update("effectiveFrom", e.target.value)}
            />
            <TextField
              type="date"
              label="Effective To"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveTo}
              onChange={(e) => update("effectiveTo", e.target.value)}
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={form.overtimeEnable}
                onChange={(e) => update("overtimeEnable", e.target.checked)}
              />
            }
            label="Enable Overtime"
          />

          {form.overtimeEnable && (
            <Stack direction="row" gap={3}>
              <TimePicker
                label="OT Start"
                value={timeVal(form.overtimeStartTime)}
                onChange={(v) => setTime("overtimeStartTime", v)}
              />
              <TextField
                label="OT Minutes"
                type="number"
                value={form.overtimeMinutes}
                onChange={(e) => update("overtimeMinutes", e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
