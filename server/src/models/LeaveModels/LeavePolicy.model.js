import { sequelize } from "../../config/db.js";
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
    effectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    effectiveTo: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    appliesTo: {
      type: DataTypes.ENUM("employee", "manager", "all"),
      allowNull: false,
      defaultValue: "employee",
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
  },
  {
    timestamps: true,
    tableName: "LeavePolicy",
    paranoid: true,
  },
);

export default LeavePolicy;
