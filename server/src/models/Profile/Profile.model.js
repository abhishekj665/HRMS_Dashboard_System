import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Profile = sequelize.define(
  "Profile",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    profileUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adharUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    panCardUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adharNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  },
);

export default Profile;
