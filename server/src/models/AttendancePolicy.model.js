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
    shiftType : {
      type : DataTypes.ENUM("SAMEDAY", "OVERNIGHT")
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
    breakTime: {
      type: DataTypes.TIME,
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
  },
  {
    timestamps: true,
    tableName: "AttendancePolicy",
    paranoid: true,
    indexes: [{ fields: ["startTime", "endTime", "isDefault"] }],
  },
);

export default AttendancePolicy;
