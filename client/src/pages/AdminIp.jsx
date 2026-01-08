import { blockIP, getUser, unBlockIP } from "../services/adminService";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";

export default function AdminIps() {
  const [userIPs, setUserIPs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const role = user.role;

  const fetchUser = async () => {
    try {
      const response = await getUser();

      if (!response.success) {
        toast.error(response.message || "Failed to fetch users");
        return;
      }

      const ips = response.data.data.data[0]?.UserIPs || [];
      setUserIPs(ips);

      if (searchInput) {
        const foundIp = ips.find((ip) => ip.ipAddress === searchInput);
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
      "Are you sure you want to block this ip?"
    );

    if (!isConfirmed) return;
    try {
      let response = await blockIP(searchInput);
      toast.success("IP Blocked");

      fetchUser();
    } catch (error) {
      toast.error(response.message);
    }
  };

  const handleUnBlock = async () => {
    if (searchInput == "") {
      toast.error("IP address cannot be empty");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to unblock this ip?"
    );

    if (!isConfirmed) return;
    try {
      let response = await unBlockIP(searchInput);
      fetchUser();

      toast.success("IP Unblocked");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (role == "user") {
    return <h1>You don't have permission for Dashboard</h1>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        IP Management
      </h1>

      <div className="flex">
        <Stack spacing={2} sx={{ width: 300 }}>
          <Autocomplete
            freeSolo
            disableClearable
            options={userIPs.map((option) => option.ipAddress)}
            inputValue={searchInput}
            onInputChange={(event, newInputValue) => {
              setSearchInput(newInputValue);

              const foundIp = userIPs.find(
                (ip) => ip.ipAddress === newInputValue
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

      {userIPs.length === 0 && <p className="text-gray-500">No IPs found</p>}

      {userIPs.map((userip, index) => (
        <div
          key={userip.id || index}
          className="p-2 border-b flex gap-4 items-center"
        >
          <span className="font-semibold text-gray-600 w-8">{index + 1}.</span>

          <div>
            <p>{userip.ipAddress}</p>
            <p className="text-sm text-gray-500">
              Status: {userip.isBlocked ? "Blocked" : "Active"}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
