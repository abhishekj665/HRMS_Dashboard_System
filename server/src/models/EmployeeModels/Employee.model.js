import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Employee = sequelize.define(
  "Employee",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    joiningDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "Employees",
  },
);

export default Employee;
