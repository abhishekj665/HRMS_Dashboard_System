import { AssetRequest, Asset, User } from "../../models/Associations.model.js";

import { Op } from "sequelize";

import ExpressError from "../../utils/Error.utils.js";

import STATUS from "../../constants/Status.js";

export const createAssetRequestService = async (data, user) => {
  const { assetId, quantity, description } = data;
  const userId = user.id;

  if (!assetId || !quantity) {
    throw new ExpressError(400, "assetId and quantity are required");
  }

  const asset = await Asset.findByPk(assetId);

  if (!asset) throw new ExpressError(404, "Asset not found");

  await AssetRequest.create({
    userId,
    assetId,
    title: asset.title,
    quantity,
    description,
  });

  return { success: true, message: "Asset request created successfully" };
};

export const getAssetRequestService = async (id) => {
  try {
    const requestData = await AssetRequest.findAll({
      order: [["createdAt", "DESC"]],
      where: { userId : id },
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

export const getAvailableAssetsService = async () => {
  let response = await Asset.findAll({
    where: {
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
