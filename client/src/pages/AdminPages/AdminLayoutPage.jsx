import Sidebar from "../../components/AdminDashboard/SideBar";
import Topbar from "../../components/TopBar";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentSubscription } from "../../services/SubscriptionService/subscriptionDetailsService";
import { fetchUser } from "../../redux/auth/authThunk";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const checkSubscription = async () => {
      if (loading) return;

      const allowedWithoutSubscription = [
        "/admin/profile",
        "/admin/subscription/payment",
        "/admin/subscription/thank-you",
      ];

      const response = await getCurrentSubscription();
      if (!active) return;
      if (response?.status === 401 || response?.status === 403) {
        dispatch(fetchUser());
        return;
      }
      const hasSubscription = response?.success;

      if (!hasSubscription && !allowedWithoutSubscription.includes(location.pathname)) {
        navigate("/admin/subscription/payment");
        return;
      }

      setSubscriptionChecked(true);
    };

    checkSubscription();
    return () => {
      active = false;
    };
  }, [dispatch, loading, location.pathname, navigate]);

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
