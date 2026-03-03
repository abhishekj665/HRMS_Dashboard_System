import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const InterviewAuditLog = sequelize.define(
  "InterviewAuditzLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    interviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    interviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(
        "CREATED",
        "CONFIRMED",
        "DECLINED",
        "RESCHEDULED",
        "CANCELLED",
        "COMPLETED",
      ),
      allowNull: false,
    },
    performedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    oldScheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    newScheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "InterviewAuditLog",
    paranoid: true,
  },
);

export default InterviewAuditLog;
