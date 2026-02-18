import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const LeavePolicy = sequelize.define(
  "LeavePolicy",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    carryForwardAllow: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    carryForwardLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "LeavePolicy",
    paranoid: true,
  },
);

export default LeavePolicy;
