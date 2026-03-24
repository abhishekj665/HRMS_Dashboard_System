import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const LeaveAuditLog = sequelize.define("LeaveAuditLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  tenantId : {
      type: DataTypes.UUID,
      allowNull: true,
    },

  leaveRequestId: {
    type: DataTypes.UUID,
    allowNull: false
  },

  action: {
    type: DataTypes.ENUM(
      "APPLIED",
      "APPROVED",
      "REJECTED",
      "CANCELLED",
      "BALANCE_DEDUCTED",
      "BALANCE_RESTORED"
    ),
    allowNull: false
  },

  previousStatus: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "CANCELLED"),
    allowNull: true
  },

  newStatus: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "CANCELLED"),
    allowNull: true
  },

  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reviewedAt : {
    type : DataTypes.DATE,
    allowNull : true
  },

  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }

}, {
  timestamps: true,
  tableName: "LeaveAuditLog",
  paranoid: true
});


export default LeaveAuditLog;
