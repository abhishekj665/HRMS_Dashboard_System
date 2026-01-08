import {
  AssetRequest,
  User,
  UserIP,
  Asset,
  UserAsset,
} from "../models/index.model.js";

import { Op } from "sequelize";

import bcrypt from "bcrypt";
import ExpressError from "../utils/Error.utils.js";
import { getPagination } from "../utils/paginations.utils.js";
import STATUS from "../config/constants/Status.js";

export const getUsersService = async (page, limits) => {
  try {
    const { limit, offset } = getPagination(page, limits);

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: UserIP,
          required: false,
          attributes: ["ipAddress", "isBlocked", "createdAt", "updatedAt"],
        },
      ],
    });

    return {
      success: true,
      data: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new ExpressError(400, error.message);
  }
};

export const updateUserService = async (userId, data) => {
  try {
    if (!userId) {
      const err = new Error("User ID is required");

      throw new ExpressError(401, err.message);
    }

    const updateData = {};

    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.contact !== undefined) updateData.contact = data.contact;
    if (data.email !== undefined) updateData.email = data.email;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const [updatedCount] = await User.update(updateData, {
      where: { id: userId },
    });

    if (updatedCount === 0) {
      throw new ExpressError(400, "User not found or no changes made");
    }

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const deleteUserService = async (id) => {
  try {
    let user = await User.destroy({ where: { id } });

    if (!user) return { message: "User not found" };

    return { success: true, message: "User Deleted" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const getProfileService = async (id) => {
  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return { success: true, user, message: "User Fetched" };
  } catch (err) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
};

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
      where: { userId: id },
      include: [
        {
          model: Asset,
          attributes: ["title", "category", "price", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
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
