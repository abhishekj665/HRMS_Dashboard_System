import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";

export default function AttendancePolicy({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    shiftType: "SAMEDAY",
    isDefault: false,
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
  });

  const update = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleWeekend = (day) => {
    const set = new Set(form.weekends);
    set.has(day) ? set.delete(day) : set.add(day);
    update("weekends", Array.from(set));
  };

  const handleSubmit = () => {

    const attendancePayload = {
      shiftType: form.shiftType,
      isDefault: form.isDefault,
      startTime: form.startTime,
      endTime: form.endTime,
      breakTime: form.breakTime,
      gracePunchInTime: form.gracePunchInTime,
      gracePunchOutTime: form.gracePunchOutTime,
      graceHalfDayMinute: Number(form.graceHalfDayMinute),
      graceAbsentMinute: Number(form.graceAbsentMinute),
      graceLateMinute: Number(form.graceLateMinute),
      weekends: form.weekends,
    };

    const overtimePayload = {
      enable: form.overtimeEnable,
      overtimeHours: form.overtimeHours,
      overtimeMinutes: Number(form.overtimeMinutes),
    };

    onSubmit({ attendancePayload, overtimePayload });
  };

  const weekendDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="font-bold text-xl">
        Create Attendance Policy
      </DialogTitle>

      <DialogContent>

        {/* SHIFT SECTION */}
        <div className="grid grid-cols-2 gap-4 mt-2">

          <TextField
            select
            label="Shift Type"
            value={form.shiftType}
            onChange={(e) => update("shiftType", e.target.value)}
            fullWidth
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

          <TextField
            label="Start Time"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            fullWidth
          />

          <TextField
            label="End Time"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            fullWidth
          />

          <TextField
            label="Break Time"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.breakTime}
            onChange={(e) => update("breakTime", e.target.value)}
            fullWidth
          />
        </div>

        <Divider className="my-6" />

        {/* GRACE SECTION */}
        <h3 className="font-semibold mb-3">Grace Rules</h3>

        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Grace Punch In"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.gracePunchInTime}
            onChange={(e) => update("gracePunchInTime", e.target.value)}
          />

          <TextField
            label="Grace Punch Out"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.gracePunchOutTime}
            onChange={(e) => update("gracePunchOutTime", e.target.value)}
          />

          <TextField
            label="Grace Half Day (min)"
            type="number"
            value={form.graceHalfDayMinute}
            onChange={(e) => update("graceHalfDayMinute", e.target.value)}
          />

          <TextField
            label="Grace Absent (min)"
            type="number"
            value={form.graceAbsentMinute}
            onChange={(e) => update("graceAbsentMinute", e.target.value)}
          />

          <TextField
            label="Grace Late (min)"
            type="number"
            value={form.graceLateMinute}
            onChange={(e) => update("graceLateMinute", e.target.value)}
          />
        </div>

        <Divider className="my-6" />

        {/* WEEKENDS */}
        <h3 className="font-semibold mb-3">Weekends</h3>

        <div className="flex flex-wrap gap-2">
          {weekendDays.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleWeekend(d)}
              className={`px-3 py-1 rounded border text-sm
                ${form.weekends.includes(d)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"}
              `}
            >
              {d}
            </button>
          ))}
        </div>

        <Divider className="my-6" />

        {/* OVERTIME */}
        <h3 className="font-semibold mb-3">Overtime Policy</h3>

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
          <div className="grid grid-cols-2 gap-4 mt-3">
            <TextField
              label="Overtime Hours"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={form.overtimeHours}
              onChange={(e) => update("overtimeHours", e.target.value)}
            />

            <TextField
              label="Overtime Minutes"
              type="number"
              value={form.overtimeMinutes}
              onChange={(e) => update("overtimeMinutes", e.target.value)}
            />
          </div>
        )}

      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Policy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
