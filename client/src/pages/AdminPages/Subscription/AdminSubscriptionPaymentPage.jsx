import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Chip, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import { createPaymentOrder } from "../../../services/PaymentService/paymentService";
import { getSubscriptionPlans } from "../../../services/SubscriptionService/subscriptionService";

const getRazorpayKey = () => import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function AdminSubscriptionPaymentPage() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      const response = await getSubscriptionPlans();

      if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
        const mappedPlans = response.data.map((plan) => ({
          id: plan.id,
          name: plan.name,
          billing: plan.durationType === "YEAR" ? "Yearly" : "Monthly",
          durationMonths: plan.durationType === "YEAR" ? plan.duration * 12 : plan.duration,
          amount: Number(plan.price),
          employeeLimit: plan.employmentLimit,
          features: Array.isArray(plan.features) ? plan.features : [],
        }));
        setPlans(mappedPlans);
        setSelectedPlanId(mappedPlans[0].id);
      } else {
        setPlans([]);
        setSelectedPlanId(null);
        toast.error(response?.message || "No active plans found");
      }

      setLoadingPlans(false);
    };

    fetchPlans();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((item) => item.id === selectedPlanId) || plans[0],
    [plans, selectedPlanId],
  );

  const handleCheckout = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    setPaying(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const orderRes = await createPaymentOrder({
        amount: selectedPlan.amount,
        receipt: `subscription_${selectedPlan.id}_${Date.now()}`,
        planId: selectedPlan.id,
      });

      if (!orderRes?.success) {
        toast.error(orderRes?.message || "Could not create payment order");
        return;
      }

      const order = orderRes.data;
      const key = getRazorpayKey();
      if (!key) {
        toast.error("Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID in client .env.");
        return;
      }

      const razorpay = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "HRMS Dashboard",
        description: `${selectedPlan.name} Subscription`,
        order_id: order.id,
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
        },
        notes: {
          plan: selectedPlan.name,
          billing: selectedPlan.billing,
        },
        theme: {
          color: "#1d4ed8",
        },
        handler: () => {
          toast.success("Payment completed successfully");
          navigate("/admin/subscription/thank-you", {
            state: { plan: selectedPlan },
          });
        },
      });

      razorpay.on("payment.failed", (response) => {
        const reason =
          response?.error?.description ||
          response?.error?.reason ||
          response?.error?.source ||
          "Payment failed";
        toast.error(reason);
      });

      razorpay.open();
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <BoltIcon className="text-blue-700" />
            <h1 className="text-2xl font-bold text-slate-900">Choose Your Subscription Plan</h1>
          </div>
          <p className="text-slate-600">
            Select a plan and continue with secure payment to activate or extend your subscription.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const selected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`text-left rounded-2xl border p-5 transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 shadow"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                  <Chip label={plan.billing} size="small" color={selected ? "primary" : "default"} />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">Rs. {plan.amount}</p>
                <p className="text-sm text-slate-600">Up to {plan.employeeLimit} employees</p>
                <div className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#16a34a", mt: "1px" }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Selected Plan</p>
            <p className="text-xl font-bold text-slate-900">{selectedPlan?.name} - Rs. {selectedPlan?.amount}</p>
            <p className="text-sm text-slate-600">
              {selectedPlan?.durationMonths} month{selectedPlan?.durationMonths > 1 ? "s" : ""} billing cycle
            </p>
          </div>
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={paying || loadingPlans || !selectedPlan}
            sx={{ px: 4, py: 1.3, borderRadius: "12px", fontWeight: 700 }}
          >
            {paying ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Proceed to Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
