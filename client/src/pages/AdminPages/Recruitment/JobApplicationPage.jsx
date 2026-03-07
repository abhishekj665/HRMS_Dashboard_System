import {
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
} from "@mui/material";

import { Autocomplete } from "@mui/material";

import { IconButton, Tooltip } from "@mui/material";

import { TablePagination } from "@mui/material";

import { Visibility, RestartAlt } from "@mui/icons-material";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { useNavigate } from "react-router-dom";

import { getApplications } from "../../../services/JobRecruitmentService/appllicationService";
import { getAllJobPosts } from "../../../services/JobRecruitmentService/jobPostService";
import { getApplicationById } from "../../../services/JobRecruitmentService/appllicationService";
import { toast } from "react-toastify";

import ApplicationDetailDrawer from "./ApplicationDrawer";

export default function AdminApplicationsPage() {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(undefined);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedApplication, setSelectedApplication] = useState(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await getApplications({
        page: page + 1,
        limit: rowsPerPage,
        jobId: selectedJob?.id,
        search,
        stageId: stageFilter,
        status: statusFilter,
      });

      if (!res?.success) {
        setRows([]);
        setTotalRows(0);
        return;
      }

      const pagination = res.data;

      const formattedRows = pagination.rows.map((item) => ({
        id: item.id,
        candidateName: `${item.candidate?.firstName || ""} ${item.candidate?.lastName || ""}`,
        email: item.candidate?.email || "N/A",
        contact: item.candidate?.contact || "N/A",
        jobSlug: item.jobPosting?.slug || "N/A",
        jobTitle: item.jobPosting?.title || "N/A",
        stage: item.currentStage?.name || "N/A",
        status: item.status,
        appliedAt: item.appliedAt,
      }));

      setRows(formattedRows);
      setTotalRows(pagination.total);
    } catch (error) {
      console.error(error);
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id) => {
    try {
      setDetailOpen(true);
      setSelectedApplication(null);

      const response = await getApplicationById(id);

      if (!response?.data) {
        toast.error("Invalid application data");
        return;
      }

      setSelectedApplication(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, rowsPerPage, search, stageFilter, statusFilter, selectedJob]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await getAllJobPosts();

      if (res?.success) {
        setJobs(res.data);
      }
    };

    fetchJobs();
  }, [selectedApplication]);

  const columns = [
    {
      field: "candidateName",
      headerName: "Candidate",
      flex: 1,
    },
    {
      field: "jobSlug",
      headerName: "Job Slug",
      flex: 1,
    },
    {
      field: "stage",
      headerName: "Stage",
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value} color="info" size="small" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "REJECTED"
              ? "error"
              : params.value === "SHORTLISTED"
                ? "success"
                : "default"
          }
          size="small"
        />
      ),
    },
    {
      field: "appliedAt",
      headerName: "Applied",
      flex: 1,
      renderCell: (params) => dayjs(params.value).format("DD MMM YYYY"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View">
            <IconButton onClick={() => handleAction(params.row.id)}>
              <Visibility />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth={false} disableGutters>
      <Card>
        <CardContent>
          {/* FILTER BAR */}
          <Stack direction="row" spacing={2} mb={3} alignItems="center">
            <Autocomplete
              size="small"
              options={jobs}
              value={selectedJob}
              onChange={(event, newValue) => {
                setSelectedJob(newValue);
              }}
              getOptionLabel={(option) => option?.title || ""}
              renderInput={(params) => (
                <TextField {...params} label="Select Job" />
              )}
              sx={{ minWidth: 250 }}
            />

            <Select
              size="small"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Stages</MenuItem>
              <MenuItem value="Applied">Applied</MenuItem>
              <MenuItem value="Shortlisted">Shortlist</MenuItem>
              <MenuItem value="Technical Round">Technical Round</MenuItem>
              <MenuItem value="HR Round">HR Round</MenuItem>
              <MenuItem value="Selected">Selected</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>

            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
              <MenuItem value="OFFERED">Offered</MenuItem>
              <MenuItem value="HIRED">Hired</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
            </Select>

            <Button
              startIcon={<RestartAlt />}
              onClick={() => {
                setSearch("");
                setStageFilter("");
                setStatusFilter("");
                setSelectedJob(null);
              }}
            >
              Reset
            </Button>
          </Stack>

          {/* TABLE */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job Slug</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.candidateName}</TableCell>
                    <TableCell>{row.jobSlug}</TableCell>
                    <TableCell>
                      <Chip label={row.stage} color="info" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={
                          row.status === "REJECTED"
                            ? "error"
                            : row.status === "SHORTLISTED"
                              ? "success"
                              : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(row.appliedAt).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          handleAction(row.id);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalRows}
              page={page}
              onPageChange={(event, newPage) => {
                setPage(newPage);
              }}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[2, 5, 10]}
            />
          </TableContainer>
        </CardContent>
      </Card>

      <ApplicationDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        application={selectedApplication}
        setSelectedApplication={setSelectedApplication}
        refreshList={fetchApplications}
      />
    </Container>
  );
}
