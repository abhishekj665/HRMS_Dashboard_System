import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const AttendanceRequest = sequelize.define(
  "AttendanceRequest",
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
    attendanceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    requestType: {
      type: DataTypes.ENUM("CORRECTION", "OVERTIME", "REGULARIZATION"),
      allowNull: false,
    },
    requestedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    requestedTo: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("APPROVED", "REJECTED", "PENDING"),
      defaultValue: "PENDING",
    },
  },
  {
    timestamps: true,
    tableName: "AttendanceRequest",
    paranoid: true,
  },
);

export default AttendanceRequest;
