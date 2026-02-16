import { sequelize } from "../config/db.js";
import { DataTypes, UUID, UUIDV4 } from "sequelize";

const AttendancePolicy = sequelize.define(
  "AttendancePolicy",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    shiftType: {
      type: DataTypes.ENUM("SAMEDAY", "OVERNIGHT"),
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    breakMinute: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gracePunchInTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    gracePunchOutTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    graceHalfDayMinute: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    graceAbsentMinute: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    graceLateMinute: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    weekends: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    
    effectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    effectiveTo: {
      type: DataTypes.DATEONLY,
      allowNull: true, // null = open ended
    },
  },
  {
    timestamps: true,
    tableName: "AttendancePolicy",
    paranoid: true,
  },
);

export default AttendancePolicy;
