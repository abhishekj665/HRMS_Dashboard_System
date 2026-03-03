import { sequelize } from "../../config/db.js";
import { DataTypes } from "sequelize";

const InterviewFeedback = sequelize.define(
  "InterviewFeedback",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    interviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isSubmitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    submittedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    technicalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    communicationScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    problemSolvingScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recommendation: {
      type: DataTypes.ENUM("HIRE", "HOLD", "REJECT"),
      allowNull: false,
      defaultValue: "HOLD",
    },
    strength: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    weakness: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "InterviewFeedback",
    paranoid: true,
  },
);

export default InterviewFeedback;
