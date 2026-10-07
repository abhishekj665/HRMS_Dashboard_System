import {
  blockIP,
  getAllIps,
  unBlockIP,
} from "../../../services/AdminService/ipService";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import { Button, Pagination, Typography } from "@mui/material";
import { useSelector } from "react-redux";

export default function AdminIps() {
  const [page, setPage] = useState(1); // MUI Pagination is 1-based
  const [limit] = useState(10);
  const [userIPs, setUserIPs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [total, setTotal] = useState(0);
  const { user } = useSelector((state) => state.auth);

  const role = user?.role;

  const fetchUser = async () => {
    try {
      const response = await getAllIps(page, limit);

      if (!response?.success) {
        toast.error(response?.message || "Failed to fetch IPs");
        return;
      }

      const rows = response.data?.rows || [];
      setUserIPs(rows);
      setTotal(response.data?.total || 0);

      if (searchInput) {
        const foundIp = rows.find((ip) => ip.ipAddress === searchInput);
        setIsBlocked(foundIp ? foundIp.isBlocked : false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlock = async () => {
    if (searchInput == "") {
      toast.error("IP address cannot be empty");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to block this ip?",
    );

    if (!isConfirmed) return;
    try {
      await blockIP(searchInput);
      toast.success("IP Blocked");

      fetchUser();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnBlock = async () => {
    if (searchInput == "") {
      toast.error("IP address cannot be empty");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to unblock this ip?",
    );

    if (!isConfirmed) return;
    try {
      await unBlockIP(searchInput);
      fetchUser();

      toast.success("IP Unblocked");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [page, limit]);

  if (role == "employee") {
    return <h1>You don't have permission for Dashboard</h1>;
  }

  const uniqueIpOptions = Array.from(
    new Set(userIPs?.map((ip) => ip.ipAddress)),
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;

  return (
    <>
      <div className="max-w-full mx-auto mt-5 px-2 ">
        <Typography variant="h5" style={{ marginBottom: "8px" }}>
          IP Management
        </Typography>

        <div className="flex ">
          <Stack spacing={2} sx={{ width: 300, margin: "10px" }}>
            <Autocomplete
              freeSolo
              disableClearable
              options={uniqueIpOptions}
              inputValue={searchInput}
              onInputChange={(event, newInputValue) => {
                setSearchInput(newInputValue);

                const foundIp = userIPs.find(
                  (ip) => ip.ipAddress === newInputValue,
                );
                setIsBlocked(foundIp ? foundIp.isBlocked : false);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search IP" type="search" />
              )}
            />
          </Stack>
          {isBlocked ? (
            <Button onClick={handleUnBlock}>unBlock</Button>
          ) : (
            <Button onClick={handleBlock}>Block</Button>
          )}
        </div>

        {userIPs.length === 0 && (
          <p className="text-gray-500 m-5">No IPs found</p>
        )}

        {userIPs.map((userip, index) => (
          <div
            key={userip.ipAddress}
            className="p-2 border-b flex gap-4 items-center"
          >
            <span className="font-semibold text-gray-600 w-8">
              {startIndex + index + 1}.
            </span>

            <div>
              <p>{userip.ipAddress}</p>
              <p className="text-sm text-gray-500">
                Status: {userip.isBlocked ? "Blocked" : "Active"}
              </p>
            </div>
          </div>
        ))}

        <div className="flex justify-end m-5">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </div>
      </div>
    </>
  );
}
