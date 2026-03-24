import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const LeavePolicyRule = sequelize.define(
  "LeavePolicyRule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tenantId : {
      type: DataTypes.UUID,
      allowNull: true,
    },
    policyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    quotaPerYear: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    carryForwardAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    carryForwardLimit: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    }
  },
  {
    tableName: "LeavePolicyRule",
    timestamps: true,
    paranoid: true,
  },
);

export default LeavePolicyRule;
