import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WorkOffOutlinedIcon from "@mui/icons-material/WorkOffOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import { getInternalJobPosts } from "../../services/JobRecruitmentService/internalJobsService";
import JobDetailDialog from "./JobDetailDialogPage";

const PAGE_SIZE = 10;

const VISIBILITY_OPTIONS = [
  { label: "All visibility", value: "" },
  { label: "Public", value: "EXTERNAL" },
  { label: "Internal", value: "INTERNAL" },
];

const VISIBILITY_CHIP = {
  external: { label: "Public", color: "default" },
  internal: { label: "Internal", color: "info" },
  both: { label: "Both", color: "success" },
};

const getVisibility = (job) => {
  const raw = String(
    job.visibility ??
      job.visibilityType ??
      job.jobVisibility ??
      job.visibleTo ??
      "",
  ).toLowerCase();
  return raw === "public" ? "external" : raw;
};

const getDepartment = (job) =>
  job.requisition?.department?.name ||
  (typeof job.department === "string" ? job.department : "");

const getLocation = (job) => job.requisition?.location || "";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Muted = ({ children = "Not specified" }) => (
  <Typography variant="body2" color="text.disabled">
    {children}
  </Typography>
);

const VisibilityChip = ({ job }) => {
  const chip = VISIBILITY_CHIP[getVisibility(job)];
  if (!chip) return <Muted />;
  return (
    <Chip
      size="small"
      label={chip.label}
      color={chip.color}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

const JobCard = ({ job, onOpen }) => {
  const department = getDepartment(job);
  const location = getLocation(job);
  const posted = formatDate(job.createdAt);
  const visibility = job?.visibility;

  return (
    <Paper
      variant="outlined"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: "pointer",
        "&:active": { bgcolor: "action.hover" },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>
            {job.title || job.name}
          </Typography>
          {job.slug && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              component="div"
            >
              {job.slug}
            </Typography>
          )}
        </Box>
        <VisibilityChip job={job} />
      </Stack>

      <Stack spacing={0.75} mt={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ApartmentOutlinedIcon fontSize="small" color="disabled" />
          {department ? (
            <Typography variant="body2">{department}</Typography>
          ) : (
            <Muted />
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <PlaceOutlinedIcon fontSize="small" color="disabled" />
          {location ? (
            <Typography variant="body2">{location}</Typography>
          ) : (
            <Muted />
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarTodayOutlinedIcon fontSize="small" color="disabled" />
          {posted ? (
            <Typography variant="body2">Posted {posted}</Typography>
          ) : (
            <Muted />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

const EmptyState = () => (
  <Stack alignItems="center" spacing={1} py={8} px={2} textAlign="center">
    <WorkOffOutlinedIcon color="disabled" sx={{ fontSize: 44 }} />
    <Typography fontWeight={600}>No job posts found</Typography>
    <Typography variant="body2" color="text.secondary">
      Try changing the visibility filter to see more positions.
    </Typography>
  </Stack>
);

const InternalJobPosts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobSlug = searchParams.get("job");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [visibility, setVisibility] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: PAGE_SIZE };
      if (visibility) params.visibility = visibility;

      const res = await getInternalJobPosts(params);
      const body = res.data?.data ?? res.data;
      const list = Array.isArray(body)
        ? body
        : (body?.jobs ?? body?.items ?? []);

      setJobs(list);
      setTotal(
        res.data?.total ??
          body?.total ??
          res.data?.pagination?.total ??
          list.length,
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load job posts.");
    } finally {
      setLoading(false);
    }
  }, [page, visibility]);

  useEffect(() => {
    if (user) fetchJobs();
  }, [user, fetchJobs]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const toApiVisibility = (job) => {
    const v = getVisibility(job);
    if (v === "external") return "EXTERNAL";
    if (v === "internal") return "INTERNAL";
    return "";
  };

  const openJob = (job) => {
    if (!job.slug) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("job", job.slug);
      const vis = toApiVisibility(job);
      if (vis) next.set("visibility", vis);
      else next.delete("visibility");
      return next;
    });
  };

  const closeJob = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("job");
      next.delete("visibility");
      return next;
    });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const isEmpty = !loading && !error && jobs.length === 0;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1400,
        mx: "auto",
        width: "100%",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Internal Job Posts
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Browse open positions -
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: { sm: 200 }, flex: { xs: 1, sm: "none" } }}
          >
            <InputLabel id="visibility-label" shrink>
              Visibility
            </InputLabel>
            <Select
              labelId="visibility-label"
              label="Visibility"
              value={visibility}
              displayEmpty
              notched
              onChange={(e) => {
                setVisibility(e.target.value);
                setPage(1);
              }}
              renderValue={(selected) =>
                VISIBILITY_OPTIONS.find((o) => o.value === selected)?.label
              }
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            startIcon={<RestartAltIcon />}
            disabled={!visibility}
            onClick={() => {
              setVisibility("");
              setPage(1);
            }}
          >
            Reset
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchJobs}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {isMobile ? (
        <Stack spacing={1.5}>
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={132} />
            ))}

          {!loading &&
            jobs.map((job) => (
              <JobCard
                key={job._id || job.id}
                job={job}
                onOpen={() => openJob(job)}
              />
            ))}

          {isEmpty && (
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <EmptyState />
            </Paper>
          )}
        </Stack>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {[
                    "Job Title",
                    "Department",
                    "Location",
                    "Visibility",
                    "Posted",
                  ].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, py: 1.75 }}>
                      {h}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 700, py: 1.75 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" height={28} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!loading &&
                  jobs.map((job) => {
                    const department = getDepartment(job);
                    const location = getLocation(job);
                    const posted = formatDate(job.createdAt);
                    return (
                      <TableRow
                        key={job._id || job.id}
                        hover
                        onClick={() => openJob(job)}
                        sx={{
                          cursor: "pointer",
                          "&:last-child td": { borderBottom: 0 },
                        }}
                      >
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {job.title || job.name}
                          </Typography>
                          {job.slug && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {job.slug}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{department || <Muted />}</TableCell>
                        <TableCell>{location || <Muted />}</TableCell>
                        <TableCell>
                          <VisibilityChip job={job} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {posted || <Muted />}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View details">
                            <IconButton
                              aria-label="View details"
                              onClick={(e) => {
                                e.stopPropagation();
                                openJob(job);
                              }}
                            >
                              <VisibilityOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {isEmpty && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ borderBottom: 0 }}>
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {!error && total > 0 && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1.5}
          mt={2.5}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {from}–{to} of {total}
          </Typography>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            color="primary"
            shape="rounded"
            size={isMobile ? "small" : "medium"}
            siblingCount={isMobile ? 0 : 1}
            disabled={loading}
          />
        </Stack>
      )}

      <JobDetailDialog
        open={Boolean(selectedJobSlug)}
        jobSlug={selectedJobSlug}
        visibility={searchParams.get('visibility') || ''}
        onClose={closeJob}
      />
    </Box>
  );
};

export default InternalJobPosts;
