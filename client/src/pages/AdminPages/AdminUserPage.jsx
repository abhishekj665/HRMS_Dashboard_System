import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import { registerUser } from "../../services/adminService";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { blockUser, unBlockUser, getUser } from "../../services/adminService";

const roleColor = (role) => {
  if (role === "admin") return "error";
  if (role === "manager") return "warning";
  return "primary";
};

const AdminUserPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [openCreateUser, setOpenCreateUser] = useState(false);

  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  if (user?.role !== "admin") {
    return <h1>You don't have permission for this page</h1>;
  }

  const fetchUsers = async (currentPage = page) => {
    try {
      const res = await getUser(currentPage, limit, search);

      if (!res.success) {
        toast.error(res.message || "Failed to fetch users");
        return;
      }

      setUsers(res.data.users);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Are you sure you want to block this user?")) return;

    const res = await blockUser(id);
    if (res.success) {
      toast.success(res.message);
      fetchUsers();
    } else toast.error(res.message);
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;

    const res = await unBlockUser(id);
    if (res.success) {
      toast.success(res.message);
      fetchUsers();
    } else toast.error(res.message);
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password) {
      return toast.error("Email and password required");
    }

    try {
      const res = await registerUser(userForm);

      if (res.success) {
        toast.success("User registered successfully");
        setUserForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        });
        setOpenCreateUser(false);
        fetchUsers(1);
        setPage(1);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to register user");
      setUserForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
      });
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [limit]);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return (
    <div className="max-w-full mx-auto mt-10 px-6">
      <Dialog
        open={openCreateUser}
        onClose={() => setOpenCreateUser(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Register User</DialogTitle>

        <DialogContent className="flex flex-col gap-3 ">
          &nbsp;
          <TextField
            size="small"
            label="First Name"
            className=""
            value={userForm.first_name}
            onChange={(e) =>
              setUserForm({ ...userForm, first_name: e.target.value })
            }
          />
          <TextField
            size="small"
            label="Last Name"
            value={userForm.last_name}
            onChange={(e) =>
              setUserForm({ ...userForm, last_name: e.target.value })
            }
          />
          <TextField
            size="small"
            label="Email"
            type="email"
            required
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
          />
          <TextField
            size="small"
            label="Password"
            type="password"
            required
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreateUser(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser}>
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">User Management</h1>

        <div className="flex items-center gap-4">
          <Button variant="contained" onClick={() => setOpenCreateUser(true)}>
            + Register User
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Blocked</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell>{(page - 1) * limit + i + 1}</TableCell>
                <TableCell>{u.email?.split("@")[0]}</TableCell>

                <TableCell>
                  <Chip
                    label={u.role}
                    size="small"
                    
                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={u.isVerified ? "Verified" : "Unverified"}
                    size="small"
                    
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={u.isBlocked ? "Yes" : "No"}
                    size="small"
                    
                  />
                </TableCell>

                <TableCell>
                  {u.manager
                    ? `${u.manager.first_name} ${u.manager.last_name || ""}`
                    : "Manager Not Assigned"}
                </TableCell>

                <TableCell>
                  {u.isBlocked ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleUnblock(u.id)}
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleBlock(u.id)}
                    >
                      Block
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-end items-center gap-3 mt-4">
        <Button
          size="small"
          variant="outlined"
          disabled={page === 1}
          onClick={handlePrev}
        >
          Prev
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          size="small"
          variant="outlined"
          disabled={page === totalPages}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminUserPage;
