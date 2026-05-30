import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import {
  Organization,
  Plans,
  Subscription,
} from "../../models/Associations.model.js";
import { Op } from "sequelize";

export const getSubscription = async (userId) => {
  try {
    const organization = await Organization.findOne({
      where: { ownerId: userId },
      include: [
        {
          model: Subscription,
          as: "subscription",
          where: { isActive: true, validTill: { [Op.gt]: new Date() } },
          order: [["createdAt", "DESC"]],
          attributes: { exclude: ["deletedAt"] },
          include: [
            {
              model: Plans,
              as: "plan",
              attributes: { exclude: ["deletedAt"] },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const subscription = organization?.subscription;

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
        status: STATUS.NOT_FOUND,
      };
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

export const getPlans = async () => {
  try {
    const plans = await Plans.findAll({
      where: { status: "ACTIVE" },
      order: [["price", "ASC"]],
      attributes: { exclude: ["deletedAt"] },
    });

    return {
      success: true,
      data: plans,
      message: "Plans found",
      status: STATUS.OK,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
