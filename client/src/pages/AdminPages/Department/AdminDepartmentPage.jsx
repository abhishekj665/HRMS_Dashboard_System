import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import GroupsIcon from "@mui/icons-material/Groups";
import EngineeringIcon from "@mui/icons-material/Engineering";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FlagIcon from "@mui/icons-material/Flag";
import { toast } from "react-toastify";
import {
  createDepartment,
  getDepartments,
} from "../../../services/DepartmentService/departmentService";

const getBadgeColor = (score) => {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "error";
};

const getNameInitials = (name) => {
  if (!name) return "NA";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getPriorityColor = (priority) => {
  if (priority === "HIGH") return "error";
  if (priority === "MEDIUM") return "warning";
  return "success";
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

function SummaryCard({ title, value, icon, subtitle }) {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Box color="primary.main">{icon}</Box>
        </Stack>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

function TabPanel({ activeTab, index, children }) {
  if (activeTab !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function AdminDepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [createForm, setCreateForm] = useState({
    name: "",
  });

  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);
      const response = await getDepartments();

      if (!response.success) {
        toast.error(response.message || "Failed to fetch departments");
        return;
      }

      const list = Array.isArray(response.data) ? response.data : [];
      setDepartments(list);
    } catch (error) {
      toast.error(error.message || "Unable to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    const name = createForm.name.trim();
    if (!name) {
      toast.error("Department name is required");
      return;
    }

    try {
      setCreatingDepartment(true);
      const response = await createDepartment({ name });

      if (!response.success) {
        toast.error(response.message || "Unable to create department");
        return;
      }

      toast.success("Department created successfully");
      setCreateForm({ name: "" });
      setOpenCreateDialog(false);
      fetchDepartmentsData();
    } catch (error) {
      toast.error(error.message || "Unable to create department");
    } finally {
      setCreatingDepartment(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((department) =>
      (department.name || "").toLowerCase().includes(query),
    );
  }, [departments, searchValue]);

  const selectedDepartment = useMemo(() => {
    return (
      filteredDepartments.find(
        (department) => department.id === selectedDepartmentId,
      ) || filteredDepartments[0]
    );
  }, [filteredDepartments, selectedDepartmentId]);

  const summary = useMemo(() => {
    const totals = departments.reduce(
      (acc, department) => {
        acc.departments += 1;
        acc.members += department?.counts?.members || 0;
        acc.managers += department?.counts?.managers || 0;
        acc.projects += department?.counts?.ongoingProjects || 0;
        acc.performance += department?.performance?.score || 0;
        return acc;
      },
      {
        departments: 0,
        members: 0,
        managers: 0,
        projects: 0,
        performance: 0,
      },
    );

    return {
      ...totals,
      averagePerformance: totals.departments
        ? Math.round(totals.performance / totals.departments)
        : 0,
    };
  }, [departments]);

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  useEffect(() => {
    if (!filteredDepartments.length) {
      setSelectedDepartmentId("");
      return;
    }

    const exists = filteredDepartments.some(
      (department) => department.id === selectedDepartmentId,
    );
    if (!exists) {
      setSelectedDepartmentId(filteredDepartments[0].id);
    }
  }, [filteredDepartments, selectedDepartmentId]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Department</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Department Name"
              fullWidth
              size="small"
              value={createForm.name}
              onChange={(event) =>
                setCreateForm({ name: event.target.value })
              }
              placeholder="Ex: Engineering, Design, Marketing"
              disabled={creatingDepartment}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            disabled={creatingDepartment}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateDepartment}
            disabled={creatingDepartment}
          >
            {creatingDepartment ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background:
            "linear-gradient(130deg, rgba(2,132,199,0.12) 0%, rgba(29,78,216,0.08) 100%)",
          border: "1px solid #dbeafe",
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Department Control Center
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Choose a department, then explore details tab by tab like a real
              production dashboard.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDepartmentsData}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddBusinessIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Department
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Departments"
            value={summary.departments}
            icon={<AddBusinessIcon />}
            subtitle="Registered business units"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Users"
            value={summary.members}
            icon={<GroupsIcon />}
            subtitle="Mapped department members"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Managers"
            value={summary.managers}
            icon={<EngineeringIcon />}
            subtitle="Current department leads"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Avg Performance"
            value={`${summary.averagePerformance}%`}
            icon={<TrendingUpIcon />}
            subtitle="Portfolio delivery trend"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Departments
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search department"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </Box>

            {loading ? (
              <LinearProgress />
            ) : (
              <List sx={{ maxHeight: "62vh", overflowY: "auto", p: 1 }}>
                {filteredDepartments.map((department) => {
                  const isSelected = selectedDepartment?.id === department.id;
                  return (
                    <ListItemButton
                      key={department.id}
                      selected={isSelected}
                      onClick={() => {
                        setSelectedDepartmentId(department.id);
                        setActiveTab(0);
                      }}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        border: isSelected
                          ? "1px solid #93c5fd"
                          : "1px solid transparent",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={700}>
                            {department.name}
                          </Typography>
                        }
                        secondary={
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 0.8, flexWrap: "wrap" }}
                          >
                            <Chip
                              size="small"
                              label={`${department?.counts?.members || 0} users`}
                            />
                            <Chip
                              size="small"
                              label={`${
                                department?.performance?.score || 0
                              }% perf`}
                              color={getBadgeColor(
                                department?.performance?.score || 0,
                              )}
                            />
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {!selectedDepartment ? (
            <Alert severity="info">
              No department found. Create one to start managing.
            </Alert>
          ) : (
            <Paper
              sx={{
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0" }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedDepartment.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created on {formatDate(selectedDepartment.createdAt)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<GroupsIcon />}
                      label={`${selectedDepartment?.counts?.members || 0} Users`}
                    />
                    <Chip
                      icon={<WorkHistoryIcon />}
                      label={`${
                        selectedDepartment?.counts?.ongoingProjects || 0
                      } Ongoing`}
                    />
                    <Chip
                      color={getBadgeColor(
                        selectedDepartment?.performance?.score || 0,
                      )}
                      label={`${selectedDepartment?.performance?.score || 0}%`}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Tabs
                value={activeTab}
                onChange={(event, value) => setActiveTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 1.5, borderBottom: "1px solid #e2e8f0" }}
              >
                <Tab label="Overview" />
                <Tab label="Team" />
                <Tab label="Projects" />
                <Tab label="Performance" />
              </Tabs>

              <Box sx={{ p: 2.5 }}>
                <TabPanel activeTab={activeTab} index={0}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <SummaryCard
                        title="Members"
                        value={selectedDepartment?.counts?.members || 0}
                        icon={<GroupsIcon />}
                        subtitle="Department users"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <SummaryCard
                        title="Managers"
                        value={selectedDepartment?.counts?.managers || 0}
                        icon={<EngineeringIcon />}
                        subtitle="Leadership strength"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <SummaryCard
                        title="Projects"
                        value={selectedDepartment?.counts?.ongoingProjects || 0}
                        icon={<WorkHistoryIcon />}
                        subtitle="Active pipeline"
                      />
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel activeTab={activeTab} index={1}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Managers ({selectedDepartment?.managers?.length || 0})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1.2}>
                        {selectedDepartment?.managers?.length ? (
                          selectedDepartment.managers.map((manager) => (
                            <Stack
                              key={manager.id}
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
                                {getNameInitials(manager.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {manager.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {manager.email}
                                </Typography>
                              </Box>
                            </Stack>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No manager assigned.
                          </Typography>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Users ({selectedDepartment?.members?.length || 0})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1.5}>
                        {(selectedDepartment?.members || []).map((member) => (
                          <Grid key={member.id} size={{ xs: 12, sm: 6 }}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.2,
                                borderRadius: 2,
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
                                  {getNameInitials(member.name)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {member.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {member.email}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                        {!selectedDepartment?.members?.length ? (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                              No users in this department.
                            </Typography>
                          </Grid>
                        ) : null}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </TabPanel>

                <TabPanel activeTab={activeTab} index={2}>
                  {selectedDepartment?.ongoingProjects?.length ? (
                    <Stack spacing={1.2}>
                      {selectedDepartment.ongoingProjects.map((project) => (
                        <Accordion key={project.id}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              width="100%"
                              justifyContent="space-between"
                            >
                              <Typography fontWeight={600}>{project.title}</Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip size="small" label={project.status} />
                                <Chip
                                  size="small"
                                  icon={<FlagIcon />}
                                  color={getPriorityColor(project.priority)}
                                  label={project.priority || "LOW"}
                                />
                              </Stack>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Headcount
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {project.headCount || 0}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Created
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatDate(project.createdAt)}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Current Status
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {project.status}
                                </Typography>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info">No ongoing projects right now.</Alert>
                  )}
                </TabPanel>

                <TabPanel activeTab={activeTab} index={3}>
                  <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        mb={2}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          Performance Index
                        </Typography>
                        <Chip
                          color={getBadgeColor(
                            selectedDepartment?.performance?.score || 0,
                          )}
                          label={`${selectedDepartment?.performance?.score || 0}%`}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Team activity and project throughput score
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={selectedDepartment?.performance?.score || 0}
                        sx={{ height: 10, borderRadius: 99, mb: 2 }}
                      />

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Active members
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedDepartment?.performance?.activeMembers || 0}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Total members
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedDepartment?.performance?.totalMembers || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </TabPanel>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
