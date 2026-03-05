import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const Application = sequelize.define(
  "Application",
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
    candidateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Candidate",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    jobPostingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    currentStageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "REJECTED",
        "OFFERED",
        "ON_HOLD",
        "HIRED",
        "WITHDRAWN",
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    referredByEmployeeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rejectReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    withdrawReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    hiredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true, tableName: "Application", paranoid: true },
);

export default Application;
