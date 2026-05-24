import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Payment = sequelize.define(
  "Payment",
  {
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    planId : {
        type : DataTypes.UUID,
        allowNull : true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes : {
        type : DataTypes.JSON,
        allowNull : true
    }
  },
  {
    timestamps: true,
    tableName: "Payments",
    paranoid: true,
  },
);

export default Payment;
