import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import UserSidebar from "./UserSideBar";

const UserLayoutPage = () => {
  const [open, setOpen] = useState(false);
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
