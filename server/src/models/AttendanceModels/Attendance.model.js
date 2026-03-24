import { sequelize } from "../../config/db.js";
import { DataTypes, UUIDV4 } from "sequelize";

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenantId : {
      type: DataTypes.UUID,
      allowNull: true,
    },
    punchInAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    punchOutAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    workedMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    overtimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    isLate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isHalfDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFullDay : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    },
    lastInAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },

    approvedBy: {
      type: DataTypes.UUID,
    },

    approvedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    tableName: "Attendances",
    paranoid: true,
  },
);

export default Attendance;
