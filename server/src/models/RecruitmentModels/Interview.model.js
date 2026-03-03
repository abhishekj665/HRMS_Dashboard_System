import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Interview = sequelize.define(
  "Interview",
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
    interviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roundName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mode: {
      type: DataTypes.ENUM("ONLINE", "OFFLINE"),
      allowNull: false,
    },
    meetingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "SCHEDULED",
        "COMPLETED",
        "CANCELLED",
        "RESCHEDULED",
        "PENDING_CONFIRMATION",
        "DECLINED",
      ),
      allowNull: false,
      defaultValue: "PENDING_CONFIRMATION",
    },
    rescheduledBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    rescheduledAt: {
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
    tableName: "Interview",
    paranoid: true,
  },
);

export default Interview;
