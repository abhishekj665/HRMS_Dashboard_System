
import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Offer = sequelize.define(
  "Offer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    offeredCTC: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    joiningDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    offerDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    offerLaterUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approvalStatus: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "SENT", "DECLINED", "EXPIRED"),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Offer",
    paranoid: true,
  },
);

export default Offer;

