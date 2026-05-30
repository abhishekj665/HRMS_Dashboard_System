import { Profile, User } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

export const getProfileService = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: ["id", "email", "role", "isBlocked", "isVerified", "tenantId"],
  });

  if (!user) {
    throw new ExpressError(404, "User not found");
  }

  let profile = await Profile.findOne({ where: { userId: user.id } });

  if (!profile) {
    profile = await Profile.create({
      userId: user.id,
      first_name: "",
      last_name: "",
      contact: "",
    });
  }

  return {
    success: true,
    user: {
      ...user.toJSON(),
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      contact: profile.contact || "",
      profile: profile.toJSON(),
    },
    message: "Profile fetched successfully",
  };
};

export const upsertProfileService = async (userId, data) => {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new ExpressError(404, "User not found");
  }

  let profile = await Profile.findOne({ where: { userId: user.id } });

  if (!profile) {
    profile = await Profile.create({
      userId: user.id,
      first_name: "",
      last_name: "",
      contact: "",
    });
  }

  await profile.update({
    ...data,
  });

  return getProfileService(userId);
};
