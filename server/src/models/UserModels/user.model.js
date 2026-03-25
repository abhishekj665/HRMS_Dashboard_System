import { sequelize } from "../../config/db.js";

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
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
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
      type: DataTypes.ENUM("employee", "admin", "manager", "applicant"),
      allowNull: false,
      defaultValue: "employee",
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
