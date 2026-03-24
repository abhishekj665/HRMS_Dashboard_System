import { sequelize } from "../../config/db.js";
import { DataTypes, or } from "sequelize";

const OrganizationLegal = sequelize.define(
  "OrganizationLegal",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panCertificateUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gstCertificateUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "OrganizationLegals",
  },
);

export default OrganizationLegal;
