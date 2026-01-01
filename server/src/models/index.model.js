import User from "./user.model.js";
import OTP from "./Otp.models.js";
import UserIP from "../models/UserIP.model.js";

User.hasMany(UserIP, { foreignKey: "userId" });
UserIP.belongsTo(User, { foreignKey: "userId" });

export { User, OTP, UserIP };
