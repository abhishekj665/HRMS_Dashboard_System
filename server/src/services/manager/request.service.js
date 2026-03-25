import {
  AssetRequest,
  User,
  Asset,
  UserAsset,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";
import {
  assetRequestMailTemplate,
  assetApprovedMailTemplate,
  assetRejectedMailTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import {
  assertSameTenant,
  getScopedWhere,
  requireTenantId,
} from "../../utils/tenant.utils.js";

export const getRequestDataService = async (manager) => {
  try {
    const tenantId = requireTenantId(manager);
    const requests = await AssetRequest.findAll({
      where: { tenantId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["email", "role", "managerId"],
          where: {
            [Op.or]: [{ managerId: { [Op.ne]: null } }, { role: "manager" }],
          },
          required: true,
        },

        {
          model: Asset,
          as: "Asset",
          attributes: ["id", "title", "price", "status", "availableQuantity"],
        },
        { model: User, as: "reviewer", attributes: ["id", "email", "role"] },
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

export const rejectRequestService = async (id, remark, manager) => {
  const tenantId = requireTenantId(manager);
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
  });

  assertSameTenant(request, tenantId, "Asset request");

  if (!request || request.status !== "pending") {
    throw new ExpressError(400, "Invalid request");
  }

  request.status = "rejected";
  request.adminRemark = remark;
  request.reviewedBy = manager.id;
  await request.save();

  const managerData = await User.findByPk(manager.id, {
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
    managerName: managerData.email.split("@")[0],
  });

  sendMail(request.User.email, "Asset Request Rejected", html);

  return {
    success: true,
    userId: request.userId,
    message: "Request rejected successfully",
  };
};

export const approveRequestService = async (id, manager) => {
  const t = await sequelize.transaction();
  const tenantId = requireTenantId(manager);

  try {
    const request = await AssetRequest.findByPk(
      id,
      {
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
      },
      { transaction: t },
    );

    assertSameTenant(request, tenantId, "Asset request");

    if (!request || request.status !== "pending") {
      throw new ExpressError(400, "Invalid request");
    }

    const asset = await Asset.findByPk(request.assetId, { transaction: t });
    assertSameTenant(asset, tenantId, "Asset");

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
    request.adminRemark = `Approved by ${manager.role}`;
    request.reviewedBy = manager.id;
    await request.save({ transaction: t });

    await t.commit();

    const managerData = await User.findByPk(manager.id, {
      attributes: ["email"],
    });

    const html = assetApprovedMailTemplate({
      userName: request.User.first_name || request.User.email.split("@")[0],
      userEmail: request.User.email,
      assetName: request.Asset.title,
      quantity: request.quantity,
      assetType: request.Asset.category,
      requestDate: request.createdAt.toLocaleString("en-IN"),
      remark: "Approved by manager",
      managerName: managerData.email.split("@")[0],
    });

    sendMail(request.User.email, "Asset Request Approved", html);
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

export const createAssetRequestService = async (data, user) => {
  const { assetId, quantity, description } = data;
  const userId = user.id;
  const tenantId = requireTenantId(user);

  const userData = await User.findOne({
    where: getScopedWhere(user, { id: user.id }),
    attributes: ["email", "first_name"],
  });

  if (!assetId || !quantity) {
    throw new ExpressError(400, "assetId and quantity are required");
  }

  const asset = await Asset.findOne({
    where: getScopedWhere(user, { id: assetId }),
  });

  if (!asset) throw new ExpressError(404, "Asset not found");

  await AssetRequest.create({
    userId,
    tenantId,
    assetId,
    title: asset.title,
    quantity,
    description,
  });

  const adminData = await User.findOne({
    where: getScopedWhere(user, { role: "admin" }),
    attributes: ["email"],
  });

  const assetData = await Asset.findByPk(assetId);

  const html = assetRequestMailTemplate({
    userName: userData.first_name || userData.email.split("@")[0],
    userEmail: userData.email,
    assetName: asset.title,
    quantity,
    assetType: assetData.category,
    requestDate: new Date().toLocaleString("en-IN"),
    reason: description,
    managerName: adminData.email.split("@")[0],
  });

  sendMail(adminData.email, "New Asset Request", html);

  return { success: true, message: "Asset request created successfully" };
};
