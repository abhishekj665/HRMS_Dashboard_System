import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const UserAsset = sequelize.define("UserAsset", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  assetId: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  }
});


export default UserAsset;