import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const LeaveBalance = sequelize.define(
  "LeaveBalance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    totalAllocated: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    used: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    policyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "LeaveBalance",
    paranoid: true,
  },
);

export default LeaveBalance;
