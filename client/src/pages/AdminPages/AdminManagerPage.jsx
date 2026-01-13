import { useEffect, useState } from "react";
import { Button, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";

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
} from "@mui/material";

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  const [openCreate, setOpenCreate] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [managerForm, setManagerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const fetchUsers = async (currentPage = 1) => {
    if (loadingUsers) return;

    try {
      setLoadingUsers(true);

      const res = await getUser(currentPage, 10);

      if (res.success) {
        setUsers((prev) =>
          currentPage === 1
            ? res.data.data.data
            : [...prev, ...res.data.data.data]
        );

        setTotalPages(res.data.data.totalPages);
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

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      className="p-6 h-[85vh] overflow-y-auto"
      onScroll={(e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;

        if (
          scrollTop + clientHeight >= scrollHeight - 5 &&
          !loadingUsers &&
          page < totalPages
        ) {
          const next = page + 1;
          setPage(next);
          fetchUsers(next);
        }
      }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Manager Control</h1>

          <Button variant="contained" onClick={() => setOpenCreate(true)}>
            + Register Manager
          </Button>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-15">
          <div className="grid grid-cols-5 bg-gray-50 px-4 py-3 text-sm font-semibold">
            <span>Manager</span>
            <span>Email</span>
            <span>Assigned Users</span>
            <span>Select Users</span>
            <span>Action</span>
          </div>

          {managers.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-5 px-4 py-3 border-t items-center"
            >
              <span>{m.first_name}</span>
              <span className="truncate">{m.email?.split("@")[0]}</span>
              <span className="font-medium">{m.workers.length}</span>
              <Select
                multiple
                size="small"
                value={selectedUsers[m.id] || []}
                onChange={(e) =>
                  setSelectedUsers((prev) => ({
                    ...prev,
                    [m.id]: e.target.value,
                  }))
                }
                renderValue={(selected) => `${selected.length} selected`}
                sx={{ width: "10vw" }}
              >
                {users
                  .filter((u) => u.role !== "admin" && u.role !== "manager")
                  .map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.email?.split("@")[0]}
                    </MenuItem>
                  ))}
              </Select>

              <Button
                size="small"
                className="w-[10vw]"
                variant="contained"
                onClick={() => handleAssign(m.id)}
              >
                Assign
              </Button>
            </div>
          ))}
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
