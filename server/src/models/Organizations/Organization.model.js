import { sequelize } from "../../config/db.js";

import { DataTypes } from "sequelize";

const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    industry: {
      type: DataTypes.ENUM(
        "IT",
        "Healthcare",
        "Finance",
        "Education",
        "Manufacturing",
        "Retail",
        "Other",
      ),
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status : {
        type: DataTypes.ENUM("Active", "Inactive"),
        allowNull: false,
        defaultValue: "Active",
    }
    
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "Organizations",
  },
);

export default Organization;
