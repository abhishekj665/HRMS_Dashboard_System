import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const LeaveType = sequelize.define(
  "LeaveType",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    requiresApproval: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { timestamps: true, tableName: "LeaveType", paranoid: true },
);

export default LeaveType;
