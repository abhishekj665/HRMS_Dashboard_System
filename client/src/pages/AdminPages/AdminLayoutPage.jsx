import Sidebar from "../../components/AdminDashboard/SideBar";
import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentSubscription } from "../../services/SubscriptionService/subscriptionDetailsService";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);

  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (loading || user?.role !== "admin") return;

      const allowedWithoutSubscription = [
        "/admin/profile",
        "/admin/subscription/payment",
        "/admin/subscription/thank-you",
      ];

      const response = await getCurrentSubscription();
      const hasSubscription = response?.success;

      if (!hasSubscription && !allowedWithoutSubscription.includes(location.pathname)) {
        navigate("/admin/subscription/payment");
        return;
      }

      setSubscriptionChecked(true);
    };

    checkSubscription();
  }, [loading, user?.role, location.pathname, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== "admin") {
    return null;
  }

  if (!subscriptionChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-[96vh]  relative">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar open={open} setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
