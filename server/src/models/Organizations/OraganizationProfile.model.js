import { sequelize } from "../../config/db.js";
import { DataTypes, or } from "sequelize";

const OrganizationProfile = sequelize.define(
  "OrganizationProfile",
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
    organizationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "OrganizationProfiles",
  },
);

export default OrganizationProfile;
