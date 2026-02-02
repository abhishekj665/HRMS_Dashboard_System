import Sidebar from "../../components/SideBar";

import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);

  

  if (user?.role != "admin") {
    return <h1>You don't have permission for this</h1>;
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
