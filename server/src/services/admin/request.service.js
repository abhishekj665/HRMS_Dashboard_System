import {
  AssetRequest,
  User,
  Asset,
  UserAsset,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import { sequelize } from "../../config/db.js";
import {
  assetApprovedMailTemplate,
  assetRejectedMailTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import {
  assertSameTenant,
  getScopedWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const getRequestDataService = async (adminUser) => {
  try {
    const requests = await AssetRequest.findAll({
      where: { tenantId: requireTenantId(adminUser) },
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
        {
          model: User,
          as: "reviewer",
          attributes: ["email", "role"],
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

export const rejectRequestService = async (id, remark, adminUser) => {
  const tenantId = requireTenantId(adminUser);
  const request = await AssetRequest.findByPk(id, {
    include: [
      { model: User },
      {
        model: Asset,
        as: "Asset",
        attributes: [
          "id",
          "title",
          "price",
          "status",
          "availableQuantity",
          "category",
        ],
      },
    ],
  });

  

  assertSameTenant(request, tenantId, "Asset request");

  if (!request || request.status !== "pending") {
    throw new ExpressError(400, "Invalid request");
  }

  request.status = "rejected";
  request.adminRemark = remark;
  request.reviewedBy = adminUser.id;
  await request.save();

  const adminData = await User.findOne({
    where: getScopedWhere(adminUser, { id: adminUser.id }),
    attributes: ["email"],
  });

  const html = assetRejectedMailTemplate({
    userName: request.User.first_name || request.User.email.split("@")[0],
    userEmail: request.User.email,
    assetName: request.Asset.title,
    quantity: request.quantity,
    assetType: request.Asset.category,
    requestDate: request.createdAt.toLocaleString("en-IN"),
    reason: remark,
    managerName: adminData.email.split("@")[0],
  });

  sendMail(request.User.email, "Asset Request Rejected", html);

  return {
    success: true,
    userId: request.userId,
    message: "Request rejected successfully",
  };
};

export const approveRequestService = async (id, adminUser) => {
  const t = await sequelize.transaction();
  let committed = false;
  const tenantId = requireTenantId(adminUser);

  try {
    const request = await AssetRequest.findByPk(id, {
      include: [
        { model: User, as: "User" },
        {
          model: Asset,
          as: "Asset",
          attributes: [
            "id",
            "title",
            "price",
            "status",
            "availableQuantity",
            "category",
          ],
        },
      ],
      transaction: t,
    });

    assertSameTenant(request, tenantId, "Asset request");

    if (!request || request.status !== "pending") {
      throw new ExpressError(400, "Invalid request");
    }

    const asset = await Asset.findByPk(request.assetId, { transaction: t });
    assertSameTenant(asset, tenantId, "Asset");

    if (!asset || asset.availableQuantity < request.quantity) {
      throw new ExpressError(400, "Not enough quantity available");
    }

    if (asset.status !== "available") {
      throw new ExpressError(400, "Asset not available yet");
    }

    const totalCredited = await UserAsset.sum("quantity", {
      where: { userId: request.userId, tenantId },
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
        tenantId,
        assetId: request.assetId,
        quantity: request.quantity,
      },
      { transaction: t },
    );

    request.status = "approved";
    request.adminRemark = `Approved by admin`;
    request.reviewedBy = adminUser.id;
    await request.save({ transaction: t });

    await t.commit();
    committed = true;

    const adminData = await User.findOne({
      where: getScopedWhere(adminUser, { id: adminUser.id }),
      attributes: ["email"],
    });

    const html = assetApprovedMailTemplate({
      userName: request.User.first_name || request.User.email.split("@")[0],
      userEmail: request.User.email,
      assetName: request.Asset.title,
      quantity: request.quantity,
      assetType: request.Asset.category,
      requestDate: request.createdAt.toLocaleString("en-IN"),
      remark: "Approved by admin",
      managerName: adminData.email.split("@")[0],
    });

    sendMail(request.User.email, "Asset Request Approved", html);

    return {
      success: true,
      userId: request.userId,
      message: "Request approved and asset credited",
    };
  } catch (error) {
    if (!committed) {
      await t.rollback();
    }
    throw error;
  }
};
