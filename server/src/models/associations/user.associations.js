import User from "../UserModels/user.model.js";
import OTP from "../UserModels/Otp.models.js";
import UserIP from "../UserModels/UserIP.model.js";
import AssetRequest from "../AssetModels/AssestRequest.model.js";
import Asset from "../AssetModels/Asset.model.js";
import UserAsset from "../AssetModels/UserAsset.model.js";
import Expenses from "../UserModels/Expenses.model.js";
import Account from "../UserModels/Account.model.js";
import Employee from "../EmployeeModels/Employee.model.js";

User.hasMany(UserIP, { foreignKey: "userId" });
UserIP.belongsTo(User, { foreignKey: "userId" });

User.hasMany(OTP, { foreignKey: "userId" });
OTP.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Account, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Account.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(User, {
  as: "workers",
  foreignKey: "managerId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

User.belongsTo(User, {
  as: "manager",
  foreignKey: "managerId",
});

User.hasMany(AssetRequest, { foreignKey: "userId" });
AssetRequest.belongsTo(User, { foreignKey: "userId" });

User.hasMany(AssetRequest, { foreignKey: "reviewedBy" });
AssetRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

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
Expenses.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

User.hasOne(Employee, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Employee.belongsTo(User, {
  foreignKey: "userId",
});
