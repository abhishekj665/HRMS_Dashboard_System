import {
  Card,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
} from "@mui/material";

import { Autocomplete } from "@mui/material";

import DetailRow from "./Detail";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { toast } from "react-toastify";

import {
  assignInterview,
  getActiveInterview,
} from "../../../services/JobRecruitmentService/interviewService";

export default function InterviewTab({
  application,
  interviewers,
  refreshList,
  onClose,
}) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    mode: "ONLINE",
    interviewerId: null,
    meetingUrl: "",
    location: "",
    duration: 60,
  });

  const [activeInterview, setActiveInterview] = useState(null);
  const [checkingInterview, setCheckingInterview] = useState(true);

  const ACTIVE_STATUSES = ["SCHEDULED", "ASSIGNED", "ACCEPTED", "RESCHEDULED"];

  const isDeclined = activeInterview?.status === "DECLINED";

  useEffect(() => {
    const checkActiveInterview = async () => {
      try {
        setCheckingInterview(true);

        const res = await getActiveInterview(application.id);

        if (res?.success && res.data) {
          setActiveInterview(res.data);
        } else {
          setActiveInterview(null);
        }
      } catch (err) {
        console.error(err);
        setActiveInterview(null);
      } finally {
        setCheckingInterview(false);
      }
    };

    checkActiveInterview();
  }, [application.id]);

  const handleSave = async () => {
    if (!form.date || !form.time || !form.interviewerId) {
      toast.error("Please select date, time and interviewer");
      return;
    }

    const interviewTime = dayjs(`${form.date} ${form.time}`);

    if (interviewTime.isBefore(dayjs())) {
      toast.error("Interview must be scheduled in the future");
      return;
    }

    const scheduledAt = dayjs(
      `${form.date} ${form.time}`,
      "YYYY-MM-DD HH:mm",
    ).toISOString();

    const data = {
      applicationId: application.id,
      interviewerId: form.interviewerId,
      scheduledAt,
      mode: form.mode,
      meetingUrl: form.meetingUrl,
      location: form.location,
      duration: form.duration,
    };

    try {
      const response = await assignInterview(data);
      if (response.success) {
        toast.success("Interview scheduled successfully");
        refreshList();
        onClose();
      } else {
        toast.error(response.message);
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (checkingInterview) {
    return <Typography>Checking interview status...</Typography>;
  }

  const isActive =
    activeInterview && ACTIVE_STATUSES.includes(activeInterview.status);

  if (isActive) {
    return (
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6">Interview Already Scheduled</Typography>

        <Stack spacing={2} mt={2}>
          <DetailRow label="Round" value={activeInterview.roundName} />
          <DetailRow
            label="Interviewer"
            value={activeInterview.interviewer?.email}
          />
          <DetailRow
            label="Scheduled At"
            value={dayjs(activeInterview.scheduledAt).format(
              "DD MMM YYYY hh:mm A",
            )}
          />
          <DetailRow
            label="Duration"
            value={`${activeInterview.duration} minutes`}
          />
          <DetailRow label="Mode" value={activeInterview.mode} />

          {activeInterview.mode === "ONLINE" && (
            <DetailRow label="Meeting URL" value={activeInterview.meetingUrl} />
          )}

          <Chip label={activeInterview.status} color="success" />
        </Stack>
      </Card>
    );
  }

  if (isDeclined) {
    return (
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Previous Interview Declined
        </Typography>

        <Stack spacing={2} mt={2}>
          <DetailRow
            label="Interviewer"
            value={activeInterview.interviewer?.email}
          />
          <DetailRow
            label="Scheduled At"
            value={dayjs(activeInterview.scheduledAt).format(
              "DD MMM YYYY hh:mm A",
            )}
          />
          <Chip label="DECLINED" color="error" />

          <Button variant="contained" onClick={() => setActiveInterview(null)}>
            Schedule Again
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6">Schedule Interview</Typography>

      <Stack spacing={3} mt={2}>
        <Autocomplete
          options={interviewers}
          getOptionLabel={(option) => `${option?.email?.split("@")[0]}`}
          onChange={(event, value) =>
            setForm({
              ...form,
              interviewerId: value?.id || null,
            })
          }
          renderInput={(params) => (
            <TextField {...params} label="Select Interviewer" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        <TextField
          type="date"
          label="Interview Date"
          InputLabelProps={{ shrink: true }}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          fullWidth
        />

        <TextField
          type="time"
          label="Interview Time"
          InputLabelProps={{ shrink: true }}
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          fullWidth
        />

        <Select
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
        >
          <MenuItem value="ONLINE">Online</MenuItem>
          <MenuItem value="OFFLINE">Offline</MenuItem>
        </Select>

        {form.mode === "ONLINE" && (
          <TextField
            label="Meeting URL"
            value={form.meetingUrl}
            onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
          />
        )}

        {form.mode === "OFFLINE" && (
          <TextField
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        )}

        <Select
          value={form.duration}
          onChange={(e) =>
            setForm({
              ...form,
              duration: Number(e.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value={30}>30 Minutes</MenuItem>
          <MenuItem value={45}>45 Minutes</MenuItem>
          <MenuItem value={60}>60 Minutes</MenuItem>
          <MenuItem value={90}>90 Minutes</MenuItem>
          <MenuItem value={120}>120 Minutes</MenuItem>
        </Select>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!form.date || !form.time || !form.interviewerId}
          sx={{ width: 200 }}
        >
          Save Interview
        </Button>
      </Stack>
    </Card>
  );
}
