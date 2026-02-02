import Sidebar from "../../components/SideBar";

import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  if (user?.role != "admin") {
    setTimeout(() => {
      navigate("/login");
      toast.error("Only admin can access this page");
    }, 800);

    return;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar userName={user.email} />
        <main className="p-6 overflow-y-auto">
          <Outlet></Outlet>
        </main>
      </div>
    </div>
  );
}
