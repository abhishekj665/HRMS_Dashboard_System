import { Button } from "@mui/material";
import {
  blockIP,
  blockUser,
  getUser,
  unBlockIP,
  unBlockUser,
} from "../services/adminService";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminUserPage() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [IP, setIP] = useState("");
  const [blockeddIpPage, setBlockIpPage] = useState(false);

  const role = user?.role;

  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await getUser();

      if (!response.success) {
        toast.error(response.message || "Failed to fetch users");
        return;
      }

      setUserData(response.data.data.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlock = async (id) => {
    try {
      console.log(id);
      let response = await blockUser(id);
      if (response.success) {
        toast.success(response.message);
        fetchUser();
        // window.location.reload();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnBlock = async (id) => {
    try {
      let response = await unBlockUser(id);
      if (response.success) {
        toast.success(response.message);
        fetchUser();
        // window.location.reload();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchUser();
  }, [getUser]);

  const handleLogIn = async () => {
    navigate("/login");
  };

  if (role == "user") {
    return <h1>You don't have permission for Dashboard</h1>;
  }

  return (
    <>
      {role == "admin" ? (
        <main className="p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">
            Users Overview
          </h1>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-5 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Blocked</span>

              <span className="text-center">User Action</span>
            </div>

            {userData.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-5 px-4 py-3 text-sm text-gray-700 border-t hover:bg-gray-50 transition"
              >
                <span className="truncate">{user.email}</span>

                <span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </span>

                <span>
                  {user.isVerified ? (
                    <span className="text-green-600 font-medium">Verified</span>
                  ) : (
                    <span className="text-red-500 font-medium">Unverified</span>
                  )}
                </span>

                <span>{user.isBlocked ? "Yes" : "No"}</span>

                <div className="flex justify-center">
                  {user.isBlocked ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleUnBlock(user.id)}
                    >
                      Unblock User
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleBlock(user.id)}
                    >
                      Block User
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <div className="flex justify-center items-center mt-5">
          <h1>You have to LogIn First</h1>&nbsp;&nbsp;
          <Button variant="contained" color="success" onClick={handleLogIn}>
            LogIn
          </Button>
        </div>
      )}
    </>
  );
}
