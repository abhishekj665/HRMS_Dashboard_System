import { AssetRequest, Asset, User } from "../../models/Associations.model.js";

import { Op } from "sequelize";

import ExpressError from "../../utils/Error.utils.js";

import STATUS from "../../constants/Status.js";
import { assetRequestMailTemplate } from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { getScopedWhere, requireTenantId } from "../../utils/tenant.utils.js";

export const createAssetRequestService = async (data, user) => {
  const { assetId, quantity, description } = data;
  const userId = user.id;
  const tenantId = requireTenantId(user);

  const userData = await User.findOne({
    where: getScopedWhere(user, { id: user.id }),
    attributes: ["managerId", "email", "first_name"],
    include: [{ model: User, as: "manager" }],
  });

  if (userData.managerId === null || userData.managerId === undefined) {
    return {
      success: false,
      message: "You don't have an assigned manager to send this request",
    };
  }

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

  const assetData = await Asset.findByPk(assetId);

  

  const html = assetRequestMailTemplate({
    userName: userData.first_name || userData.email.split("@")[0],
    userEmail: userData.email,
    assetName: asset.title,
    quantity,
    assetType: assetData.category,
    requestDate: new Date().toLocaleString("en-IN"),
    reason: description,
    managerName: userData.manager.email.split("@")[0],
  });

  sendMail(userData.manager.email, "New Asset Request", html);

  return { success: true, message: "Asset request created successfully" };
};

export const getAssetRequestService = async (id, user) => {
  try {
    const requestData = await AssetRequest.findAll({
      order: [["createdAt", "DESC"]],
      where: getScopedWhere(user, { userId: id }),
      include: [
        { model: User, attributes: ["email", "role"] },
        {
          model: Asset,
          attributes: ["id", "title", "price", "status", "availableQuantity"],
        },
        { model: User, as: "reviewer", attributes: ["id", "email", "role"] },
      ],
    });

    return {
      success: true,
      requestData,
      message: "Data fetched",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getAvailableAssetsService = async (user) => {
  let response = await Asset.findAll({
    where: {
      tenantId: requireTenantId(user),
      availableQuantity: { [Op.gt]: 0 },
    },
    attributes: ["id", "title", "price", "category", "availableQuantity"],
  });

  return {
    success: true,
    data: response,
    message: "Assest Fetched Successfully",
  };
};
