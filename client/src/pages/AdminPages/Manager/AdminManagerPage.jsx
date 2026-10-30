import { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";

import {
  getManagersWithUsers,
  assignManager,
  registerNewManager,
} from "../../../services/AdminService/managerService";
import { getUser } from "../../../services/AdminService/userService";
import { getDepartments } from "../../../services/DepartmentService/departmentService";

/* ---------- UI tokens (match dashboard) ---------- */
const PRIMARY = "#1a56db";
const PRIMARY_HOVER = "#1648b8";
const PRIMARY_SOFT = "#e8f0fe";
const BORDER = "#e6eaf2";
const TEXT_MUTED = "#6b7280";

const cardSx = {
  backgroundColor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 3,
};

const primaryBtnSx = {
  backgroundColor: PRIMARY,
  textTransform: "none",
  borderRadius: 2,
  boxShadow: "none",
  "&:hover": { backgroundColor: PRIMARY_HOVER, boxShadow: "none" },
};

/* ---------- helpers ---------- */
const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  if (fullName) return fullName;
  return user?.email?.split("@")[0] || "Unknown User";
};

const getInitials = (user) => {
  const first = user?.first_name?.[0] || "";
  const last = user?.last_name?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || (user?.email?.[0] || "U").toUpperCase();
};

const AVATAR_COLORS = [
  "#1a56db",
  "#7c3aed",
  "#0f766e",
  "#c2410c",
  "#be185d",
  "#4338ca",
  "#0369a1",
];

const getAvatarColor = (user) => {
  const key = `${user?.id || ""}${user?.email || ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++)
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const UserAvatar = ({ user, size = 40 }) => (
  <Avatar
    src={user?.profile_image || user?.profileImage || undefined}
    sx={{
      width: size,
      height: size,
      bgcolor: getAvatarColor(user),
      fontSize: size * 0.4,
      fontWeight: 600,
    }}
  >
    {getInitials(user)}
  </Avatar>
);

const PersonRow = ({ user, size = 36 }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
    <UserAvatar user={user} size={size} />
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
        {getDisplayName(user)}
      </Typography>
      <Typography variant="caption" sx={{ color: TEXT_MUTED }} noWrap>
        {user?.email}
      </Typography>
    </Box>
  </Box>
);

const StatCard = ({ label, value, icon, color, bg }) => (
  <Box
    sx={{ ...cardSx, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        backgroundColor: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: TEXT_MUTED, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const headCellSx = {
  color: TEXT_MUTED,
  fontWeight: 600,
  fontSize: 13,
  backgroundColor: "#f8faff",
  borderBottom: `1px solid ${BORDER}`,
  whiteSpace: "nowrap",
};

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  const [openCreate, setOpenCreate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null);
  const [drawerManagerId, setDrawerManagerId] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [managerSearch, setManagerSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const [managerForm, setManagerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState([]);

  const requestRef = useRef(0);
  const listRef = useRef(null);
  const sentinelRef = useRef(null);

  const fetchUsers = async (currentPage = 1, searchValue = "") => {
    const requestId = ++requestRef.current;

    try {
      setLoadingUsers(true);

      const res = await getUser(currentPage, 15, searchValue);

      // ignore outdated responses (fast typing / quick scrolling)
      if (requestId !== requestRef.current) return;

      if (res.success) {
        const newUsers = res.data.users;

        setUsers((prev) =>
          currentPage === 1 ? newUsers : [...prev, ...newUsers],
        );

        setHasNext(res.data.pagination.hasNext);
      }
    } catch {
      if (requestId === requestRef.current) toast.error("Failed to load users");
    } finally {
      if (requestId === requestRef.current) setLoadingUsers(false);
    }
  };

  const fetchData = async () => {
    try {
      const m = await getManagersWithUsers();
      if (m.success) setManagers(m.data);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      } else {
        toast.error(response.message || "Failed to load departments");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load departments");
    }
  };

  const handleAssign = async (managerId) => {
    const workerIds = selectedUsers[managerId];
    if (!workerIds || workerIds.length === 0) {
      return toast.error("Select users first");
    }

    try {
      const res = await assignManager({ managerId, workerIds });
      if (res.success) {
        toast.success("Users assigned");
        setSelectedUsers((prev) => ({
          ...prev,
          [managerId]: [],
        }));
        setAssignTarget(null);
        fetchData();
      }
    } catch {
      setSelectedUsers((prev) => ({
        ...prev,
        [managerId]: [],
      }));
      toast.error("Assignment failed");
    }
  };

  const handleCreateManager = async () => {
    if (
      !managerForm.email ||
      !managerForm.password ||
      !managerForm.departmentId
    ) {
      return toast.error("Email, password and department are required");
    }

    try {
      const res = await registerNewManager(managerForm);

      if (res.success) {
        toast.success("Manager created");
        setManagerForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          departmentId: "",
        });
        setOpenCreate(false);
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to create manager");
    }
  };

  const loadMore = () => {
    if (!hasNext || loadingUsers) return;
    const next = page + 1;
    setPage(next);
    fetchUsers(next, userSearch);
  };

  const openAssignDialog = (manager) => {
    setUserSearch("");
    setUsers([]);
    setPage(1);
    setHasNext(true);
    setAssignTarget(manager);
  };

  const getAvailableUsers = (manager) =>
    users.filter(
      (u) =>
        !(manager.workers || []).some((w) => w.id === u.id) &&
        (manager.departmentId && u.departmentId
          ? manager.departmentId === u.departmentId
          : true),
    );

  const getDepartmentName = (departmentId) =>
    departments.find((d) => d.id === departmentId)?.name;

  const toggleUser = (managerId, user) => {
    setSelectedProfiles((prev) => ({ ...prev, [user.id]: user }));
    setSelectedUsers((prev) => {
      const prevSelected = prev[managerId] || [];
      return {
        ...prev,
        [managerId]: prevSelected.includes(user.id)
          ? prevSelected.filter((id) => id !== user.id)
          : [...prevSelected, user.id],
      };
    });
  };

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  // load first page when the assign dialog opens, and on (debounced) search
  useEffect(() => {
    if (!assignTarget) return;

    const timer = setTimeout(
      () => {
        setPage(1);
        fetchUsers(1, userSearch);
      },
      userSearch ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [userSearch, assignTarget?.id]);

  // infinite scroll: load the next page when the bottom of the list is visible
  useEffect(() => {
    if (!assignTarget) return;

    const root = listRef.current;
    const node = sentinelRef.current;
    if (!root || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [assignTarget, users, hasNext, loadingUsers, page, userSearch]);

  const filteredManagers = managers.filter(
    (m) =>
      (!deptFilter || m.departmentId === deptFilter) &&
      `${getDisplayName(m)} ${m.email || ""}`
        .toLowerCase()
        .includes(managerSearch.toLowerCase()),
  );
  const pagedManagers = filteredManagers.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage,
  );

  const totalAssigned = managers.reduce(
    (sum, m) => sum + (m.workers || []).length,
    0,
  );
  const managersWithoutTeam = managers.filter(
    (m) => (m.workers || []).length === 0,
  ).length;

  const drawerManager = managers.find((m) => m.id === drawerManagerId) || null;

  const availableUsers = assignTarget ? getAvailableUsers(assignTarget) : [];
  const selectedIds = assignTarget ? selectedUsers[assignTarget.id] || [] : [];
  const selectedCount = selectedIds.length;
  const allSelected =
    availableUsers.length > 0 &&
    availableUsers.every((u) => selectedIds.includes(u.id));

  const toggleAll = () => {
    if (!assignTarget) return;
    const managerId = assignTarget.id;

    setSelectedProfiles((prev) => ({
      ...prev,
      ...Object.fromEntries(availableUsers.map((u) => [u.id, u])),
    }));
    setSelectedUsers((prev) => {
      const current = prev[managerId] || [];
      if (allSelected) {
        return {
          ...prev,
          [managerId]: current.filter(
            (id) => !availableUsers.some((u) => u.id === id),
          ),
        };
      }
      const toAdd = availableUsers
        .filter((u) => !current.includes(u.id))
        .map((u) => u.id);
      return { ...prev, [managerId]: [...current, ...toAdd] };
    });
  };

  return (
    <Box
      sx={{ backgroundColor: "#fff", p: { xs: 2, md: 3 }, minHeight: "100%" }}
    >
      {/* ---------- Page header ---------- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#111827" }}>
            Manager - Employee Assignment
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_MUTED, mt: 0.5 }}>
            Register managers and assign employees to their teams
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddAlt1OutlinedIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ ...primaryBtnSx, px: 3 }}
        >
          Register Manager
        </Button>
      </Box>

      {/* ---------- Stats ---------- */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          label="Total Managers"
          value={managers.length}
          icon={<SupervisorAccountOutlinedIcon fontSize="small" />}
          color={PRIMARY}
          bg={PRIMARY_SOFT}
        />
        <StatCard
          label="Employees Assigned"
          value={totalAssigned}
          icon={<PeopleAltOutlinedIcon fontSize="small" />}
          color="#0f766e"
          bg="#e0f5f2"
        />
        <StatCard
          label="Managers Without Team"
          value={managersWithoutTeam}
          icon={<PersonOffOutlinedIcon fontSize="small" />}
          color="#ed6c02"
          bg="#fff4e5"
        />
      </Box>

      {/* ---------- Managers table ---------- */}
      <Box sx={{ ...cardSx, overflow: "hidden" }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            Managers
            <Typography
              component="span"
              variant="body2"
              sx={{ color: TEXT_MUTED, ml: 1 }}
            >
              {filteredManagers.length}
            </Typography>
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search manager..."
              value={managerSearch}
              onChange={(e) => {
                setManagerSearch(e.target.value);
                setTablePage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: "100%", sm: 240 } }}
            />
            <TextField
              select
              size="small"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setTablePage(0);
              }}
              SelectProps={{ displayEmpty: true }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Manager</TableCell>
                <TableCell sx={headCellSx}>Department</TableCell>
                <TableCell sx={headCellSx}>Team</TableCell>
                <TableCell sx={headCellSx} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedManagers.map((m) => {
                const workers = m.workers || [];
                const departmentName = getDepartmentName(m.departmentId);

                return (
                  <TableRow
                    key={m.id}
                    hover
                    onClick={() => setDrawerManagerId(m.id)}
                    sx={{
                      cursor: "pointer",
                      "&:last-child td": { borderBottom: 0 },
                      "& td": { borderBottom: `1px solid ${BORDER}` },
                    }}
                  >
                    <TableCell>
                      <PersonRow
                        user={{
                          ...m,
                          first_name: m.first_name,
                        }}
                        size={40}
                      />
                    </TableCell>

                    <TableCell>
                      {departmentName ? (
                        <Chip
                          label={departmentName}
                          size="small"
                          sx={{
                            color: PRIMARY,
                            backgroundColor: PRIMARY_SOFT,
                            fontWeight: 500,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {workers.length === 0 ? (
                        <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                          No employees assigned
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <AvatarGroup
                            max={4}
                            sx={{
                              "& .MuiAvatar-root": {
                                width: 30,
                                height: 30,
                                fontSize: 12,
                                fontWeight: 600,
                                border: "2px solid #fff",
                              },
                            }}
                          >
                            {workers.map((w) => (
                              <Tooltip key={w.id} title={getDisplayName(w)}>
                                <Avatar
                                  src={
                                    w.profile_image ||
                                    w.profileImage ||
                                    undefined
                                  }
                                  sx={{ bgcolor: getAvatarColor(w) }}
                                >
                                  {getInitials(w)}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                          <Typography
                            variant="body2"
                            sx={{ color: TEXT_MUTED }}
                          >
                            {workers.length}{" "}
                            {workers.length === 1 ? "employee" : "employees"}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="View team">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerManagerId(m.id);
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GroupAddOutlinedIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAssignDialog(m);
                        }}
                        sx={{
                          ml: 1,
                          textTransform: "none",
                          borderRadius: 2,
                          color: PRIMARY,
                          borderColor: PRIMARY,
                          "&:hover": { backgroundColor: PRIMARY_SOFT },
                        }}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {pagedManagers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 8, textAlign: "center" }}>
                    <Typography variant="h6">No Managers Found</Typography>
                    <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                      Try a different search, or register a new manager.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />
        <TablePagination
          component="div"
          count={filteredManagers.length}
          page={tablePage}
          onPageChange={(e, newPage) => setTablePage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setTablePage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      {/* ---------- Assign employees dialog (infinite scroll) ---------- */}
      <Dialog
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3, padding: 2 } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ fontWeight: 600 }}>Assign Employees</DialogTitle>

          <IconButton onClick={() => setAssignTarget(null)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          {/* Manager summary */}
          {assignTarget && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                mb: 3,
                borderRadius: 2,
                backgroundColor: PRIMARY_SOFT,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  minWidth: 0,
                }}
              >
                <UserAvatar user={assignTarget} size={44} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                    Assigning to
                  </Typography>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                    {getDisplayName(assignTarget)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: TEXT_MUTED }}
                    noWrap
                  >
                    {assignTarget.email}
                  </Typography>
                </Box>
              </Box>

              {getDepartmentName(assignTarget.departmentId) && (
                <Chip
                  icon={<ApartmentOutlinedIcon sx={{ fontSize: 16 }} />}
                  label={getDepartmentName(assignTarget.departmentId)}
                  size="small"
                  sx={{
                    backgroundColor: "#fff",
                    color: PRIMARY,
                    fontWeight: 500,
                    "& .MuiChip-icon": { color: PRIMARY },
                  }}
                />
              )}
            </Box>
          )}

          {/* Search */}
          <Typography variant="body2" mb={1}>
            Search Employees
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Selected chips */}
          {selectedCount > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 2,
                maxHeight: 96,
                overflowY: "auto",
              }}
            >
              {selectedIds.map((id) => {
                const user = selectedProfiles[id];
                if (!user) return null;
                return (
                  <Chip
                    key={id}
                    size="small"
                    avatar={
                      <Avatar
                        src={
                          user.profile_image || user.profileImage || undefined
                        }
                        sx={{ bgcolor: `${getAvatarColor(user)} !important` }}
                      >
                        {getInitials(user)}
                      </Avatar>
                    }
                    label={getDisplayName(user)}
                    onDelete={() => toggleUser(assignTarget.id, user)}
                    sx={{
                      backgroundColor: PRIMARY_SOFT,
                      color: PRIMARY,
                      fontWeight: 500,
                      "& .MuiChip-deleteIcon": { color: PRIMARY },
                    }}
                  />
                );
              })}
            </Box>
          )}

          {/* Employee list */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              mb: 1,
            }}
          >
            <Typography variant="body2">Employees</Typography>

            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={
                    !allSelected &&
                    availableUsers.some((u) => selectedIds.includes(u.id))
                  }
                  onChange={toggleAll}
                  disabled={availableUsers.length === 0}
                />
              }
              label={<Typography variant="body2">Select all</Typography>}
            />
          </Box>

          <Box
            ref={listRef}
            sx={{
              border: `1px solid ${BORDER}`,
              borderRadius: 2,
              height: 300,
              overflowY: "auto",
            }}
          >
            {availableUsers.map((u) => {
              const checked = selectedIds.includes(u.id);

              return (
                <Box
                  key={u.id}
                  onClick={() => toggleUser(assignTarget.id, u)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    cursor: "pointer",
                    borderBottom: `1px solid ${BORDER}`,
                    backgroundColor: checked ? PRIMARY_SOFT : "transparent",
                    "&:hover": {
                      backgroundColor: checked ? PRIMARY_SOFT : "#f8faff",
                    },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={checked}
                    tabIndex={-1}
                    disableRipple
                    sx={{ p: 0.5 }}
                  />
                  <PersonRow user={u} />
                </Box>
              );
            })}

            {!loadingUsers && availableUsers.length === 0 && (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  No users found
                </Typography>
                <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                  Try a different search term.
                </Typography>
              </Box>
            )}

            {loadingUsers && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            )}

            {/* triggers the next page when scrolled into view */}
            <Box ref={sentinelRef} sx={{ height: 1 }} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
            {selectedCount} selected
          </Typography>

          <Box>
            <Button
              onClick={() => setAssignTarget(null)}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={selectedCount === 0}
              onClick={() => handleAssign(assignTarget.id)}
              sx={{ ...primaryBtnSx, px: 3, ml: 1 }}
            >
              Assign Employees
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* ---------- Manager detail drawer ---------- */}
      <Drawer
        anchor="right"
        open={Boolean(drawerManager)}
        onClose={() => setDrawerManagerId(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
      >
        {drawerManager && (
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 3,
                py: 2,
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>Manager details</Typography>
              <IconButton onClick={() => setDrawerManagerId(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />

            {/* Profile */}
            <Box
              sx={{
                px: 3,
                py: 3,
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              <UserAvatar user={drawerManager} size={64} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                  {drawerManager.first_name
                    ? getDisplayName(drawerManager)
                    : "Manager"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: TEXT_MUTED,
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 15 }} />
                  <Typography variant="body2" noWrap>
                    {drawerManager.email}
                  </Typography>
                </Box>
                {getDepartmentName(drawerManager.departmentId) && (
                  <Chip
                    icon={<ApartmentOutlinedIcon sx={{ fontSize: 16 }} />}
                    label={getDepartmentName(drawerManager.departmentId)}
                    size="small"
                    sx={{
                      mt: 1,
                      color: PRIMARY,
                      backgroundColor: PRIMARY_SOFT,
                      fontWeight: 500,
                      "& .MuiChip-icon": { color: PRIMARY },
                    }}
                  />
                )}
              </Box>
            </Box>
            <Divider />

            {/* Team list */}
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Team members
              </Typography>
              <Chip
                label={(drawerManager.workers || []).length}
                size="small"
                sx={{ fontWeight: 600, backgroundColor: "#f1f3f9" }}
              />
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 3, pb: 2 }}>
              {(drawerManager.workers || []).length === 0 ? (
                <Box
                  sx={{
                    border: `1px dashed ${BORDER}`,
                    borderRadius: 2,
                    py: 5,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                    No employees assigned yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {(drawerManager.workers || []).map((w) => (
                    <Box
                      key={w.id}
                      sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}
                    >
                      <PersonRow user={w} size={40} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<GroupAddOutlinedIcon />}
                onClick={() => {
                  const manager = drawerManager;
                  setDrawerManagerId(null);
                  openAssignDialog(manager);
                }}
                sx={primaryBtnSx}
              >
                Assign employees
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* ---------- Register manager dialog ---------- */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3, padding: 2 } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ fontWeight: 600 }}>Register Manager</DialogTitle>

          <IconButton onClick={() => setOpenCreate(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="body2" mb={1}>
                First Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter first name"
                value={managerForm.first_name}
                onChange={(e) =>
                  setManagerForm({ ...managerForm, first_name: e.target.value })
                }
              />
            </Box>

            <Box>
              <Typography variant="body2" mb={1}>
                Last Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter last name"
                value={managerForm.last_name}
                onChange={(e) =>
                  setManagerForm({ ...managerForm, last_name: e.target.value })
                }
              />
            </Box>

            <Box>
              <Typography variant="body2" mb={1}>
                Email <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type="email"
                fullWidth
                size="small"
                placeholder="name@company.com"
                value={managerForm.email}
                onChange={(e) =>
                  setManagerForm({ ...managerForm, email: e.target.value })
                }
              />
            </Box>

            <Box>
              <Typography variant="body2" mb={1}>
                Department <span style={{ color: "red" }}>*</span>
              </Typography>
              <Autocomplete
                size="small"
                options={departments}
                getOptionLabel={(option) => option?.name || ""}
                value={
                  departments.find((d) => d.id === managerForm.departmentId) ||
                  null
                }
                onChange={(event, selectedDepartment) =>
                  setManagerForm({
                    ...managerForm,
                    departmentId: selectedDepartment?.id || "",
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search or select department"
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
              <Typography variant="body2" mb={1}>
                Password <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type={showPassword ? "text" : "password"}
                fullWidth
                size="small"
                placeholder="Enter a password"
                value={managerForm.password}
                onChange={(e) =>
                  setManagerForm({ ...managerForm, password: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenCreate(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateManager}
            sx={{ ...primaryBtnSx, px: 3 }}
          >
            Register Manager
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
