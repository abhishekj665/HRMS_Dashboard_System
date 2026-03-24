import { sequelize } from "../../config/db.js";

import { DataTypes } from "sequelize";

const AttendanceLog = sequelize.define(
  "AttendanceLog",
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
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    punchType: {
      type: DataTypes.ENUM("IN", "OUT"),
      allowNull: false,
    },
    punchTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    source: {
      type: DataTypes.ENUM(
        "WEB",
        "MOBILE",
        "BIOMETRIC",
        "API",
        "ADMIN_OVERRIDE",
        "SYSTEM",
      ),
      allowNull: true,
    },
    geoLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    geoLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    invalidReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    
  },

  {
    timestamps: true,
    tableName: "AttendanceLog",
    paranoid: true,
  },
);

export default AttendanceLog;
