import User from "./user.model.js";
import OTP from "./Otp.models.js";
import UserIP from "./UserIP.model.js";
import AssetRequest from "./AssestRequest.model.js";

User.hasMany(UserIP, { foreignKey: "userId" });
UserIP.belongsTo(User, { foreignKey: "userId" });

User.hasMany(OTP, { foreignKey: "userId" });
OTP.belongsTo(User, { foreignKey: "userId" });

User.hasMany(AssetRequest, { foreignKey: "userId" });
AssetRequest.belongsTo(User, { foreignKey: "userId" });

export { User, OTP, UserIP, AssetRequest };
