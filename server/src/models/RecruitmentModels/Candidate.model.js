import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Candidate = sequelize.define(
  "Candidate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    portfolioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedInUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentCompany: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentCTC: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    expectedCTC: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    noticePeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
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
  { timestamps: true, tableName: "Candidate", paranoid: true },
);

export default Candidate;
