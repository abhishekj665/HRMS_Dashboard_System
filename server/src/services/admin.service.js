import { AssetRequest, User, Asset, UserAsset } from "../models/index.model.js";
import ExpressError from "../utils/Error.utils.js";
import { UserIP } from "../models/index.model.js";
import { successResponse } from "../utils/response.utils.js";
import STATUS from "../config/constants/Status.js";
import sequelize from "../config/db.js";

export const blockUserService = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.role === "admin") {
      return { success: false, message: "Cannot block an admin user" };
    }
    user.isBlocked = true;
    await user.save();
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockUserService = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    user.isBlocked = false;
    await user.save();
    return { success: true, message: "User unblocked successfully" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const blockIPService = async (ip) => {
  try {
    const [updatedCount] = await UserIP.update(
      { isBlocked: true },
      { where: { ipAddress: ip } }
    );

    if (updatedCount === 0) {
      throw new ExpressError(404, "IP address not found");
    }

    return {
      success: true,
      message: `IP ${ip} blocked successfully for all users`,
    };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const unblockIPService = async (ip) => {
  try {
    const [updatedCount] = await UserIP.update(
      { isBlocked: false },
      { where: { ipAddress: ip } }
    );

    if (updatedCount === 0) {
      throw new ExpressError(404, "IP address not found");
    }
    return { success: true, message: `IP ${ip} unblocked successfully` };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const getRequestDataService = async () => {
  try {
    const requests = await AssetRequest.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["email"],
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
      { transaction: t }
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
    console.log(id);
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
