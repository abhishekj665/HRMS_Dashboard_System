import Topbar from "../../components/TopBar";
import UserSidebar from "./UserSideBar";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  if (!user) {
    setTimeout(() => {
      navigate("/login");
      toast.error("Please login to access this page");
    }, 800);

    return;
  }

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
