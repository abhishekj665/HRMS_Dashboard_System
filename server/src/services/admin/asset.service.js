import { AssetRequest, Asset } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import STATUS from "../../constants/Status.js";

export const createAssetService = async (data) => {
  const {
    title,
    description,
    category,
    status,
    price,
    expiresAt,
    totalQuantity,
  } = data;

  if (!title || !description || !category || !price || !totalQuantity) {
    throw new ExpressError(400, "All required fields must be provided");
  }

  title.toLowerCase();

  const existingAsset = await Asset.findOne({
    where: {
      title,
    },
  });

  if (existingAsset) {
    existingAsset.totalQuantity += Number(totalQuantity);
    existingAsset.availableQuantity += Number(totalQuantity);

    await existingAsset.save();

    return {
      success: true,
      message: "Asset already exists. Quantity increased.",
      data: existingAsset,
    };
  }

  const asset = await Asset.create({
    title,
    description,
    category,
    status: status || "available",
    price,
    expiresAt: expiresAt || null,
    totalQuantity,
    availableQuantity: totalQuantity,
    isDeleted: false,
  });

  return {
    success: true,
    message: "Asset created successfully",
    data: asset,
  };
};

export const getAllAsset = async () => {
  try {
    let data = await Asset.findAll();

    if (!data) {
      return {
        success: false,
        message: "Not found any asset",
      };
    }

    return {
      success: true,
      data: data,
      message: "Asset Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const deleteAssetService = async (id) => {
  try {
    let asset = await Asset.findAll({
      where: { id },
      include: {
        model: AssetRequest,
        required: false,
      },
    });

    if (!asset) return { message: "Asset not found" };

    await Asset.destroy({ where: { id } });

    if (!asset) return { message: "Asset not found" };

    return { success: true, message: "Asset Deleted" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const updateAssetService = async (id, data) => {
  try {
    if (!id) {
      throw new ExpressError(400, "Asset ID is required");
    }

    const asset = await Asset.findByPk(id);

    if (!asset || asset.isDeleted) {
      throw new ExpressError(404, "Asset not found");
    }

    if (data.totalQuantity !== undefined) {
      const oldTotal = asset.totalQuantity;
      const oldAvailable = asset.availableQuantity;
      const alreadyAssigned = oldTotal - oldAvailable;

      const newTotal = Number(data.totalQuantity);

      if (newTotal < alreadyAssigned) {
        throw new ExpressError(
          400,
          `Cannot set total quantity below already assigned (${alreadyAssigned})`
        );
      }

      data.availableQuantity = newTotal - alreadyAssigned;
    }

    await asset.update(data);

    return {
      success: true,
      data: asset,
      message: "Asset updated successfully",
    };
  } catch (error) {
    throw error;
  }
};
