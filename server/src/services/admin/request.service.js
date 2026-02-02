import {
  AssetRequest,
  User,
  Asset,
  UserAsset,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import { sequelize } from "../../config/db.js";

export const getRequestDataService = async () => {
  try {
    const requests = await AssetRequest.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["email", "role"],
        },
        {
          model: Asset,
          attributes: ["id", "title", "price", "status", "availableQuantity"],
        },
      ],
    });

    return {
      success: true,
      message: "Requests fetched successfully",
      data: requests,
    };
  } catch (error) {
    throw new ExpressError(400, error.message);
  }
};

export const rejectRequestService = async (id, remark) => {
  const request = await AssetRequest.findByPk(id);

  if (!request || request.status !== "pending") {
    throw new ExpressError(400, "Invalid request");
  }

  request.status = "rejected";
  request.adminRemark = remark;
  request.reviewedBy = "admin";
  await request.save();

  return {
    success: true,
    userId: request.userId,
    message: "Request rejected successfully",
  };
};

export const approveRequestService = async (id, admin) => {
  const t = await sequelize.transaction();

  try {
    const request = await AssetRequest.findByPk(id, { transaction: t });

    if (!request || request.status !== "pending") {
      throw new ExpressError(400, "Invalid request");
    }

    const asset = await Asset.findByPk(request.assetId, { transaction: t });

    if (!asset || asset.availableQuantity < request.quantity) {
      return {
        success: false,
        message: "Not enough quantity available",
      };
    }

    if (!asset || asset.status !== "available") {
      return {
        success: false,
        message: "Not Assigned, Asset not available yet",
      };
    }

    const totalCredited = await UserAsset.sum("quantity", {
      where: { userId: request.userId },
      transaction: t,
    });

    if ((totalCredited || 0) + request.quantity > 5) {
      throw new ExpressError(400, "User credit limit exceeded");
    }

    asset.availableQuantity -= request.quantity;
    await asset.save({ transaction: t });

    await UserAsset.create(
      {
        userId: request.userId,
        assetId: request.assetId,
        quantity: request.quantity,
      },
      { transaction: t },
    );

    request.status = "approved";
    request.adminRemark = `Approved by ${admin}`;
    await request.save({ transaction: t });

    await t.commit();
    return {
      success: true,
      userId: request.userId,
      message: "Request approved and asset credited",
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
