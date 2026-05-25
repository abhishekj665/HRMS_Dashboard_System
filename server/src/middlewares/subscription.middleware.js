import { Subscription } from "../models/Associations.model.js";

export const requireAdminSubscription = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return next();
    }

    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant not found for admin user" });
    }

    const activeSubscription = await Subscription.findOne({
      where: { tenantId, isActive: true },
      order: [["createdAt", "DESC"]],
    });

    if (!activeSubscription) {
      return res.status(402).json({
        message: "Active subscription required",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message || "Subscription check failed" });
  }
};
