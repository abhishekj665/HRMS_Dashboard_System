import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import {
  getManagersWithUsers,
  assignManager,
  registerNewManager,
} from "../../services/adminService";
import { getUser } from "../../services/adminService";

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

  const [userScrolled, setUserScrolled] = useState(false);

  const [showUserList, setShowUserList] = useState(false);

  const [managerForm, setManagerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  if (user?.role != "admin") {
    setTimeout(() => {
      navigate("/login");
      toast.error("Only admin can access this page");
    }, 800);

    return;
  }

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
    if (!managerForm.email || !managerForm.password) {
      return toast.error("Email and password required");
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

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  

  const handleUserSearch = (managerId, event, value, reason) => {
    if (reason !== "input") return;

    setSearchInputs((prev) => ({
      ...prev,
      [managerId]: value,
    }));
  };

  return (
    <div className="p-6 h-[85vh] overflow-y-auto">
      <div className="p-6">
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

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-15">
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
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
                      u.email
                        .toLowerCase()
                        .includes((searchInputs[m.id] || "").toLowerCase()),
                  );

                  return (
                    <TableRow key={m.id}>
                      <TableCell>{m.first_name}</TableCell>

                      <TableCell>{m.email?.split("@")[0]}</TableCell>

                      <TableCell>{m.workers.length}</TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Search users..."
                          value={searchInputs[m.id] || ""}
                          onChange={(e) => {
                            setSearchInputs((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (search.trim() !== "") {
                                setShowUserList(true);
                                setUsers([]);
                                setPage(1);
                                setHasNext(true);
                                fetchUsers(1, searchInputs[m.id]);
                              }
                            }
                          }}
                          fullWidth
                        />

                        {(searchInputs[m.id] || "").trim() !== "" && (
                          <Paper
                            sx={{
                              mt: 1,
                              maxHeight: 150,
                              overflowY: "auto",
                              border: "1px solid #ddd",
                            }}
                            onWheel={() => setUserScrolled(true)}
                            onScroll={handleUserDropdownScroll}
                          >
                            {filteredUsers.map((u) => {
                              const checked = selectedUsers[m.id]?.includes(
                                u.id,
                              );

                              return (
                                <MenuItem
                                  key={u.id}
                                  onClick={() =>
                                    setSelectedUsers((prev) => {
                                      const prevSelected = prev[m.id] || [];

                                      return {
                                        ...prev,
                                        [m.id]: checked
                                          ? prevSelected.filter(
                                              (id) => id !== u.id,
                                            )
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
                                  {u.email.split("@")[0]}
                                </MenuItem>
                              );
                            })}

                            {loadingUsers && (
                              <MenuItem disabled>Loading...</MenuItem>
                            )}

                            {!loadingUsers && filteredUsers.length === 0 && (
                              <MenuItem disabled>No users found</MenuItem>
                            )}
                          </Paper>
                        )}

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
