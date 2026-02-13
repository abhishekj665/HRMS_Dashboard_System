import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Paper,
  Chip,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import {
  registerAttendancePolicy,
  updateAttendancePolicy,
  getAttendancePolicy,
} from "../../services/attendanceService";

import { toast } from "react-toastify";

const weekendDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const initialForm = {
  shiftType: "SAMEDAY",
  isDefault: true,
  startTime: "",
  endTime: "",
  breakTime: "",
  gracePunchInTime: "",
  gracePunchOutTime: "",
  graceHalfDayMinute: "",
  graceAbsentMinute: "",
  graceLateMinute: "",
  weekends: [],
  overtimeEnable: false,
  overtimeHours: "",
  overtimeMinutes: "",
};

export default function AttendancePolicyInline() {
  const [form, setForm] = useState(initialForm);
  const [original, setOriginal] = useState(initialForm);
  const [mode, setMode] = useState("create");
  const [id, setID] = useState(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setTime = (k, v) => update(k, v ? v.format("HH:mm") : "");
  const timeValue = (t) => (t ? dayjs(`2020-01-01T${t}`) : null);

  const toggleWeekend = (d) => {
    const s = new Set(form.weekends);
    s.has(d) ? s.delete(d) : s.add(d);
    update("weekends", [...s]);
  };

  const loadPolicy = async () => {
    const r = await getAttendancePolicy();

    if (r?.success && r.data) {
      const api = r.data;
      const ot = api.OvertimePolicy || {};

      const toHHMM = (t) => (t ? t.slice(0, 5) : "");

      const data = {
        ...initialForm,

        shiftType: api.shiftType,
        isDefault: api.isDefault,
        weekends: api.weekends || [],

        startTime: toHHMM(api.startTime),
        endTime: toHHMM(api.endTime),
        breakTime: toHHMM(api.breakTime),
        gracePunchInTime: toHHMM(api.gracePunchInTime),
        gracePunchOutTime: toHHMM(api.gracePunchOutTime),

        graceHalfDayMinute: api.graceHalfDayMinute,
        graceAbsentMinute: api.graceAbsentMinute,
        graceLateMinute: api.graceLateMinute,

        overtimeEnable: !!ot.enable,
        overtimeHours: toHHMM(ot.overtimeHours),
        overtimeMinutes: ot.overtimeMinutes ?? "",
      };

      setForm(data);
      setOriginal(data);
      setMode("update");
      setID(api.id);
    } else {
      setForm(initialForm);
      setOriginal(initialForm);
      setMode("create");
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);
  const readOnlyInputProps = {
    style: { fontWeight: 600 },
  };

  const handleSave = async () => {
    setSubmitting(true);

    const attendancePolicy = {
      shiftType: form.shiftType,
      isDefault: form.isDefault,
      startTime: form.startTime,
      endTime: form.endTime,
      breakTime: form.breakTime || null,
      gracePunchInTime: form.gracePunchInTime || null,
      gracePunchOutTime: form.gracePunchOutTime || null,
      graceHalfDayMinute: Number(form.graceHalfDayMinute || 0),
      graceAbsentMinute: Number(form.graceAbsentMinute || 0),
      graceLateMinute: Number(form.graceLateMinute || 0),
      weekends: form.weekends,
    };

    const overtimePolicy = {
      enable: form.overtimeEnable,
      overtimeHours: form.overtimeHours || null,
      overtimeMinutes: Number(form.overtimeMinutes || 0),
    };

    let res;

    if (mode === "update" && id) {
      res = await updateAttendancePolicy(
        { attendancePolicy, overtimePolicy },
        id,
      );
    } else {
      res = await registerAttendancePolicy({
        attendancePolicy,
        overtimePolicy,
      });
    }

    if (res?.success) {
      toast.success("Saved");
      setEditing(false);
      loadPolicy();
    } else {
      toast.error(res?.message || "Failed");
    }

    setSubmitting(false);
  };

  const handleCancel = () => {
    setForm(original);
    setEditing(false);
  };

  const section = (title, desc, children) => (
    <Paper className="p-6 rounded-xl space-y-4">
      <Typography fontWeight={600}>{title}</Typography>

      {desc && (
        <Typography variant="body2" color="gray" component="div">
          {desc}
        </Typography>
      )}

      {children}
    </Paper>
  );

  return (
    <Box p={3} className="space-y-6">
      <Typography variant="h5" style={{ marginBottom: "4px" }}>
        Attendance Policy
      </Typography>

      {section(
        "Shift Configuration",

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <TextField
            select
            label="Shift Type"
            value={form.shiftType}
            disabled={!editing}
            onChange={(e) => update("shiftType", e.target.value)}
          >
            <MenuItem value="SAMEDAY">Same Day</MenuItem>
            <MenuItem value="OVERNIGHT">Overnight</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.isDefault}
                disabled={!editing}
                onChange={(e) => update("isDefault", e.target.checked)}
              />
            }
            label="Active Policy"
          />

          <TimePicker
            label="Start Time"
            value={timeValue(form.startTime)}
            onChange={(v) => setTime("startTime", v)}
            disabled={!editing}
          />

          <TimePicker
            label="End Time"
            value={timeValue(form.endTime)}
            onChange={(v) => setTime("endTime", v)}
            disabled={!editing}
          />

          <TimePicker
            label="Break Duration"
            value={timeValue(form.breakTime)}
            onChange={(v) => setTime("breakTime", v)}
            disabled={!editing}
          />
        </Box>,
      )}

      {section(
        "Grace Rules",

        <Box className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          <TimePicker
            label="Punch-In Grace"
            value={timeValue(form.gracePunchInTime)}
            onChange={(v) => setTime("gracePunchInTime", v)}
            disabled={!editing}
          />

          <TimePicker
            label="Punch-Out Grace"
            value={timeValue(form.gracePunchOutTime)}
            onChange={(v) => setTime("gracePunchOutTime", v)}
            disabled={!editing}
          />

          <TextField
            label="Late Grace (min)"
            type="number"
            disabled={!editing}
            value={form.graceLateMinute}
            onChange={(e) => update("graceLateMinute", e.target.value)}
          />

          <TextField
            label="Half Day Grace (min)"
            type="number"
            disabled={!editing}
            value={form.graceHalfDayMinute}
            onChange={(e) => update("graceHalfDayMinute", e.target.value)}
          />

          <TextField
            label="Absent Grace (min)"
            type="number"
            disabled={!editing}
            value={form.graceAbsentMinute}
            onChange={(e) => update("graceAbsentMinute", e.target.value)}
          />
        </Box>,
      )}

      {section(
        "Weekends",
        "Non working days",
        <Box className="flex gap-2 flex-wrap mt-4">
          {weekendDays.map((d) => (
            <Chip
              key={d}
              label={d}
              clickable={editing}
              onClick={() => editing && toggleWeekend(d)}
              color={form.weekends.includes(d) ? "primary" : "default"}
            />
          ))}
        </Box>,
      )}

      {section(
        "Overtime",
        "Overtime limits",
        <>
          <FormControlLabel
            control={
              <Switch
                checked={form.overtimeEnable}
                disabled={!editing}
                onChange={(e) => update("overtimeEnable", e.target.checked)}
              />
            }
            label="Enable Overtime"
          />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TimePicker
              label="Overtime Starts After"
              value={timeValue(form.overtimeHours)}
              onChange={(v) => setTime("overtimeHours", v)}
              disabled={!editing || !form.overtimeEnable}
            />

            <TextField
              label="Max Overtime Minutes"
              type="number"
              disabled={!editing || !form.overtimeEnable}
              value={form.overtimeMinutes}
              onChange={(e) => update("overtimeMinutes", e.target.value)}
            />
          </Box>
        </>,
      )}

      {!editing ? (
        <Button variant="contained" onClick={() => setEditing(true)}>
          {mode === "update" ? "Edit Policy" : "Create Policy"}
        </Button>
      ) : (
        <Box className="flex gap-3">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
          >
            Save
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Box>
      )}
    </Box>
  );
}
