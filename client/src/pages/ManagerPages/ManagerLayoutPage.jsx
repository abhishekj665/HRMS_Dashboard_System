import ManagerSidebar from "./ManagerSideBar";
import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function ManagerLayout() {
  const [open, setOpen] = useState();
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.role !== "manager") {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== "manager") {
    return null;
  }
  return (
    <div className="flex h-[96vh] bg-gray-100 relative">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <ManagerSidebar open={open} setOpen={setOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar open={open} setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
