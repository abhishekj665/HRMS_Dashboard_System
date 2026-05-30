import { User } from "../../models/Associations.model.js";
import { getProfileService as getProfileDetailsService, upsertProfileService } from "../profile/profile.service.js";

import bcrypt from "bcrypt";
import ExpressError from "../../utils/Error.utils.js";


export const updateUserService = async (userId, data) => {
  try {
    if (!userId) {
      const err = new Error("User ID is required");

      throw new ExpressError(401, err.message);
    }

    const updateData = {};

    if (data.email !== undefined) updateData.email = data.email;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.first_name !== undefined || data.last_name !== undefined || data.contact !== undefined) {
      await upsertProfileService(userId, data);
    }

    const [updatedCount] = Object.keys(updateData).length
      ? await User.update(updateData, { where: { id: userId } })
      : [1];

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
    let user = await User.destroy({ where: { id }, force : true});

    if (!user) return { message: "User not found" };

    return { success: true, message: "User Deleted" };
  } catch (error) {
    return new ExpressError(400, error.message);
  }
};

export const getProfileService = async (id) => {
  return getProfileDetailsService(id);
};
