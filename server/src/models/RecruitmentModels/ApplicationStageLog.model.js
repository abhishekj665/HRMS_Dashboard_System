import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const ApplicationStageLog = sequelize.define(
  "ApplicationStageLog",
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
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fromStageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    toStageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    changedByType: {
      type: DataTypes.ENUM("CANDIDATE", "INTERVIEWER", "ADMIN", "SYSTEM"),
      allowNull: false,
      defaultValue: "SYSTEM",
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    autoMoved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    oldStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { timestamps: true, tableName: "ApplicationStageLog", paranoid: true },
);

export default ApplicationStageLog;
