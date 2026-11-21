import ManagerSidebar from "../../components/ManagerDashboard/ManagerSideBar";
import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function ManagerLayout() {
  const [open, setOpen] = useState();
  return (
    <div className="flex h-[96vh] relative">
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
