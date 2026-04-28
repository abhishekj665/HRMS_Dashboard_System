import { useEffect, useState } from "react";

import { Button, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";

import {
  getManagersWithUsers,
  assignManager,
  registerNewManager,
} from "../../../services/AdminService/managerService";
import { getUser } from "../../../services/AdminService/userService";
import { getDepartments } from "../../../services/DepartmentService/departmentService";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
} from "@mui/material";

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  const [openCreate, setOpenCreate] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);

  const [loadingUsers, setLoadingUsers] = useState(false);

  const [searchInputs, setSearchInputs] = useState({});
  const [activeManagerId, setActiveManagerId] = useState(null);

  const [managerForm, setManagerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState([]);

  const fetchUsers = async (currentPage = 1, searchValue = "") => {
    if (loadingUsers) return;

    try {
      setLoadingUsers(true);

      const res = await getUser(currentPage, 9, searchValue);

      if (res.success) {
        const newUsers = res.data.users;

        setUsers((prev) =>
          currentPage === 1 ? newUsers : [...prev, ...newUsers],
        );

        setHasNext(res.data.pagination.hasNext);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
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

  const handleUserDropdownScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;

    if (scrollHeight <= clientHeight) return;

    if (
      scrollTop + clientHeight >= scrollHeight - 20 &&
      hasNext &&
      !loadingUsers
    ) {
      setPage((prev) => {
        const next = prev + 1;
        fetchUsers(next);
        return next;
      });
    }
  };

  const getDisplayName = (user) => {
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
    if (fullName) return fullName;
    return user?.email?.split("@")[0] || "Unknown User";
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveManagerId(null);
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <div className="p-2 overflow-y-auto">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Manager Control</h1>

          <Button
            className="text-xl"
            variant="contained"
            onClick={() => setOpenCreate(true)}
          >
            Register
          </Button>
        </div>

        <div className="bg-white  shadow-sm overflow-hidden mt-15">
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Manager</b>
                  </TableCell>
                  <TableCell>
                    <b>Email</b>
                  </TableCell>
                  <TableCell>
                    <b>Assigned Users</b>
                  </TableCell>
                  <TableCell>
                    <b>Select Users</b>
                  </TableCell>
                  <TableCell>
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {managers.map((m) => {
                  const filteredUsers = users.filter(
                    (u) =>
                      !m.workers.some((w) => w.id === u.id) &&
                      (m.departmentId && u.departmentId
                        ? m.departmentId === u.departmentId
                        : true) &&
                      u.email
                        .toLowerCase()
                        .includes((searchInputs[m.id] || "").toLowerCase()),
                  );

                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        {m.first_name ? `${m.first_name} ` : "Manager"}
                      </TableCell>

                      <TableCell>{m.email?.split("@")[0]}</TableCell>

                      <TableCell>{m.workers.length}</TableCell>

                      <TableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <TextField
                            size="small"
                            placeholder="Search users..."
                            value={searchInputs[m.id] || ""}
                            onFocus={() => setActiveManagerId(m.id)}
                            onClick={() => setActiveManagerId(m.id)}
                            onChange={(e) => {
                              setSearchInputs((prev) => ({
                                ...prev,
                                [m.id]: e.target.value,
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                fetchUsers(1, searchInputs[m.id] || "");
                              }
                            }}
                            fullWidth
                          />

                          {activeManagerId === m.id && (
                            <Paper
                              sx={{
                                mt: 1,
                                maxHeight: 180,
                                overflowY: "auto",
                                border: "1px solid #ddd",
                              }}
                              onScroll={handleUserDropdownScroll}
                            >
                              {filteredUsers.map((u) => {
                                const checked = selectedUsers[m.id]?.includes(u.id);

                                return (
                                  <MenuItem
                                    key={u.id}
                                    onClick={() =>
                                      setSelectedUsers((prev) => {
                                        const prevSelected = prev[m.id] || [];

                                        return {
                                          ...prev,
                                          [m.id]: checked
                                            ? prevSelected.filter((id) => id !== u.id)
                                            : [...prevSelected, u.id],
                                        };
                                      })
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      readOnly
                                      style={{ marginRight: 8 }}
                                    />
                                    {getDisplayName(u)}
                                  </MenuItem>
                                );
                              })}

                              {loadingUsers && <MenuItem disabled>Loading...</MenuItem>}

                              {!loadingUsers && filteredUsers.length === 0 && (
                                <MenuItem disabled>No users found</MenuItem>
                              )}
                            </Paper>
                          )}
                        </div>

                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          Selected: {selectedUsers[m.id]?.length || 0}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAssign(m.id)}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <Dialog
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Register Manager</DialogTitle>

          <DialogContent className="flex flex-col gap-3 ">
            &nbsp;
            <TextField
              size="small"
              label="First Name"
              value={managerForm.first_name}
              required
              className="mt-2"
              onChange={(e) =>
                setManagerForm({ ...managerForm, first_name: e.target.value })
              }
            />
            <TextField
              size="small"
              label="Last Name"
              value={managerForm.last_name}
              onChange={(e) =>
                setManagerForm({ ...managerForm, last_name: e.target.value })
              }
            />
            <TextField
              size="small"
              label="Email"
              type="email"
              required
              value={managerForm.email}
              onChange={(e) =>
                setManagerForm({ ...managerForm, email: e.target.value })
              }
            />
            <TextField
              size="small"
              label="Password"
              type="password"
              required
              value={managerForm.password}
              onChange={(e) =>
                setManagerForm({ ...managerForm, password: e.target.value })
              }
            />
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
                  label="Department"
                  required
                  placeholder="Search or select department"
                />
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateManager}>
              Register
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
