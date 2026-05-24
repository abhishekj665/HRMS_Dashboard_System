export const SUBSCRIPTION_PLANS = [
  {
    id: "starter-monthly",
    name: "Starter",
    billing: "Monthly",
    durationMonths: 1,
    amount: 999,
    employeeLimit: 25,
    features: [
      "Attendance and leave tracking",
      "Role-based access",
      "Basic reports",
      "Email support",
    ],
  },
  {
    id: "growth-monthly",
    name: "Growth",
    billing: "Monthly",
    durationMonths: 1,
    amount: 2499,
    employeeLimit: 100,
    features: [
      "Everything in Starter",
      "Asset and expense workflows",
      "Interview and recruitment tools",
      "Priority support",
    ],
  },
  {
    id: "enterprise-yearly",
    name: "Enterprise",
    billing: "Yearly",
    durationMonths: 12,
    amount: 19999,
    employeeLimit: 500,
    features: [
      "Everything in Growth",
      "Advanced approvals",
      "Custom onboarding and account manager",
      "SLA and premium support",
    ],
  },
];

