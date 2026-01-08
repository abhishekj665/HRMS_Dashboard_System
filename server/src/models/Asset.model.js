import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Asset = sequelize.define("Asset", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  category: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("available", "not-available", "assigned", "repairing"),
  },

  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  totalQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },

  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },
});

export default Asset;
