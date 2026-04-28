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
  Autocomplete,
} from "@mui/material";

import { registerUser } from "../../../services/ManagerService/userService";
import { getDepartments } from "../../../services/DepartmentService/departmentService";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { getUser } from "../../../services/ManagerService/userService";

const roleColor = (role) => {
  if (role === "admin") return "error";
  if (role === "manager") return "warning";
  return "primary";
};

const ManagerUserPage = () => {
  const currentUser = useSelector((state) => state.auth.user);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [openCreateUser, setOpenCreateUser] = useState(false);

  const [search, setSearch] = useState("");

  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState([]);

  const fetchUsers = async (currentPage = page) => {
    try {
      const res = await getUser(currentPage, limit, search);

      if (!res.data.success) {
        toast.error(res.message || "Failed to fetch users");
        return;
      }

      setUsers(res.data.data.data);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password || !userForm.departmentId) {
      return toast.error("Email, password and department are required");
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
          departmentId: "",
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
        departmentId: "",
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch departments");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch departments");
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="p-3 max-w-full mx-auto mt-10">
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
          <Autocomplete
            size="small"
            options={departments}
            getOptionLabel={(option) => option?.name || ""}
            value={
              departments.find((d) => d.id === userForm.departmentId) || null
            }
            onChange={(event, selectedDepartment) =>
              setUserForm({
                ...userForm,
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
          <Button onClick={() => setOpenCreateUser(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser}>
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button
            className="w-20px]"
            variant="contained"
            onClick={() => setOpenCreateUser(true)}
          >
            Register
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
              <TableCell>Assigned Manager</TableCell>
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
                    color={roleColor(u.role)}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={u.isVerified ? "Verified" : "Unverified"}
                    color={u.isVerified ? "success" : "error"}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={u.isBlocked ? "Yes" : "No"}
                    size="small"
                    color={u.isBlocked ? "error" : "success"}
                  />
                </TableCell>

                <TableCell>
                  {u.manager && u.manager.id == currentUser.id
                    ? "You"
                    : u.manager
                      ? `${u.manager.first_name} ${u.manager.last_name || ""}`
                      : "Not Assigned Yet"}
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

export default ManagerUserPage;
