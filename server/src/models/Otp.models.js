import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const OTP = sequelize.define(
  "OTP",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM("SIGNUP", "LOGIN"),
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 5 * 60 * 1000),
    },
  },
  {
    timestamps: false,
  },
);

export default OTP;
