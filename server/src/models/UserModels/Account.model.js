import { sequelize } from "../../config/db.js";

import { DataTypes } from "sequelize";

const Account = sequelize.define(
  "Account",
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

    accountNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    pin: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    failedAttempt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  },
);

export default Account;
