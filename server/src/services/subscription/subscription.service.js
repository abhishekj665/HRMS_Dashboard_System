import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import {
  Organization,
  Plans,
  Subscription,
} from "../../models/Associations.model.js";

export const getSubscription = async (userId) => {
  try {
    const organization = await Organization.findOne({
      where: { ownerId: userId },
      order: [["createdAt", "DESC"]],
    });

    if (!organization) {
      throw new ExpressError(STATUS.NOT_FOUND, "Organization not found");
    }

    let subscription = null;

    if (organization.subscriptionId) {
      subscription = await Subscription.findOne({
        where: { id: organization.subscriptionId, tenantId: organization.id },
        include: [{ model: Plans, attributes: { exclude: ["deletedAt"] } }],
      });
    }

    if (!subscription) {
      subscription = await Subscription.findOne({
        where: { tenantId: organization.id },
        order: [["createdAt", "DESC"]],
        include: [{ model: Plans, attributes: { exclude: ["deletedAt"] } }],
      });
    }

    if (!subscription) {
      throw new ExpressError(STATUS.NOT_FOUND, "Subscription not found");
    }

    return {
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          subscriptionId: organization.subscriptionId,
        },
        subscription,
      },
      message: "Subscription found",
      status: STATUS.OK,
    };
  } catch (error) {
    if (error instanceof ExpressError) {
      throw error;
    }
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
