import {sequelize} from "../config/db.js";
import { DataTypes, UUIDV4 } from "sequelize";

const UserIP = sequelize.define("UserIP", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
  },
  region: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  isp: {
    type: DataTypes.STRING,
  },
  failedLogInAttempt: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

await UserIP.sync();
export default UserIP;
