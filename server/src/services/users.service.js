import { AssetRequest, User, UserIP } from "../models/index.model.js";
import bcrypt from "bcrypt";
import ExpressError from "../utils/Error.utils.js";
import { getPagination } from "../utils/paginations.utils.js";
import STATUS from "../config/constants/Status.js";
import { successResponse } from "../utils/response.utils.js";

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
  try {
    let userId = user.id;

    const asset = await AssetRequest.create({
      ...data,
      userId: userId,
    });

    return {
      success: true,
      message: "Asset Request Created Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getAssetRequestService = async (id) => {
  try {
    const requestData = await AssetRequest.findAll({
      where: { userId: id },
      order: [["createdAt", "ASC"]],
    });

    if (!requestData) {
      return { success: true, message: "No Data Found" };
    }

    return {
      success: true,
      requestData,
      message: "Data Fetched",
    };
  } catch (error) {
    return new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
