import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const AssetRequest = sequelize.define(
  "AssetRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },

    adminRemark: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
  }
);

export default AssetRequest;
