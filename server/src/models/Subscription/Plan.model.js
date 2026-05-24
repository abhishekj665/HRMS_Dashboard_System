import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Plans = sequelize.define(
  "Plans",
  {
    id : {
        type : DataTypes.UUID,
        defaultValue : DataTypes.UUIDV4,
        primaryKey : true,
        allowNull : false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    durationType: {
      type: DataTypes.ENUM("MONTH", "YEAR"),
      allowNull: false,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    employmentLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Plans",
    paranoid: true,
  },
);

export default Plans;
