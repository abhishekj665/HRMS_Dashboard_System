import { now } from "sequelize/lib/utils";
import { sequelize } from "../config/db.js";
import { DataTypes, DATE, UUID, UUIDV4 } from "sequelize";

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
      type: UUID,
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
    presentDay: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalLeaves: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ["userId"] }],
  },
);

export default Attendance;
