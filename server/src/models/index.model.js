import User from "./user.model.js";
import OTP from "./Otp.models.js";
import UserIP from "./UserIP.model.js";
import AssetRequest from "./AssestRequest.model.js";
import Asset from "./Asset.model.js";
import UserAsset from "./UserAsset.model.js";
import Expenses from "./Expenses.model.js";
import Account from "./Account.model.js";


User.hasMany(UserIP, { foreignKey: "userId" });
UserIP.belongsTo(User, { foreignKey: "userId" });

User.hasMany(OTP, { foreignKey: "userId" });
OTP.belongsTo(User, { foreignKey: "userId" });

User.hasMany(AssetRequest, { foreignKey: "userId" });
AssetRequest.belongsTo(User, { foreignKey: "userId" });

User.hasMany(UserAsset, { foreignKey: "userId" });
UserAsset.belongsTo(User, { foreignKey: "userId" });

Asset.hasMany(AssetRequest, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

AssetRequest.belongsTo(Asset, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Asset.hasMany(UserAsset, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

UserAsset.belongsTo(Asset, {
  foreignKey: "assetId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});



User.hasMany(Expenses, { foreignKey: "userId" });
Expenses.belongsTo(User, { foreignKey: "userId", as: "employee" });

User.hasMany(Expenses, { foreignKey: "reviewedBy" });
Expenses.belongsTo(User, { foreignKey: "reviewededBy", as: "reviewer" });


User.hasOne(Account, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Account.belongsTo(User, {
  foreignKey: "userId",
});



export { User, OTP, UserIP, AssetRequest, Asset, UserAsset, Account, Expenses };
