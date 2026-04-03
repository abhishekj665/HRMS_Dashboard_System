import Topbar from "../../components/TopBar";
import UserSidebar from "./UserSideBar";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";

const UserLayoutPage = () => {
  const [open, setOpen] = useState(false);
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.role !== "employee") {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== "employee") {
    return null;
  }
  return (
    <div className="flex h-[96vh]  relative">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <UserSidebar open={open} setOpen={setOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar open={open} setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayoutPage;
