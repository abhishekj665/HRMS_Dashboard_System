
import Topbar from "../../components/TopBar";
import UserSidebar from "./UserSideBar";
import { Outlet } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <UserSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="p-6 overflow-y-auto">
          <Outlet></Outlet>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
