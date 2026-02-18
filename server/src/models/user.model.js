import { sequelize } from "../config/db.js";

import { DataTypes } from "sequelize";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "manager"),
      allowNull: false,
      defaultValue: "user",
    },
    contact: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    login_At: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    totalPresentDay: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalLeaves: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    attendancePolicyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    leavePolicyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  },
);

export default User;
