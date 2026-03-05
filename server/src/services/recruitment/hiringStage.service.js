import STATUS from "../../constants/Status.js";
import {
  Application,
  HiringStage,
  ApplicationStageLog,
  User,
  Candidate,
  JobPosting,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import { sendMail } from "../../config/otpService.js";
import ExpressError from "../../utils/Error.utils.js";
import { nextRoundSelectedEmailTemplate } from "../../utils/mailTemplate.utils.js";

export const moveToNextStage = async (applicationId, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const application = await Application.findByPk(
      applicationId,
      {
        include: [
          {
            model: HiringStage,
            as: "currentStage",
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["email"],
          },
          {
            model: JobPosting,
            as: "jobPosting",
            attributes: ["title"],
          },
        ],
      },
      transaction,
    );

    if (!application) {
      throw new Error("Application not found.");
    }

    const nextStage = await HiringStage.findOne({
      where: {
        stageOrder: application.currentStage.stageOrder + 1,
      },
      transaction,
    });

    if (!nextStage) {
      throw new Error("Next stage not found.");
    }

    if (nextStage.isFinal) {
      await application.update(
        { status: "ACTIVE", currentStageId: nextStage.id },
        { transaction },
      );
      await ApplicationStageLog.create(
        {
          applicationId,
          fromStageId: application.currentStage.id,
          toStageId: nextStage.id,
          changedBy: userId,
          changedByType: "ADMIN",
          oldStatus: application.currentStage.name,
          newStatus: nextStage.name,
        },
        { transaction },
      );
    }

    if (nextStage.isOfferStage) {
      await application.update(
        { currentStageId: nextStage.id, status: nextStage.name },
        { transaction },
      );
      await ApplicationStageLog.create(
        {
          applicationId,
          fromStageId: application.currentStage.id,
          toStageId: nextStage.id,
          changedBy: userId,
          changedByType: "ADMIN",
          oldStatus: application.currentStage.name,
          newStatus: nextStage.name,
        },
        { transaction },
      );
    }

    if (!nextStage.isFinal && !nextStage.isOfferStage) {
      await application.update(
        { currentStageId: nextStage.id, status: "ACTIVE" },
        { transaction },
      );

      await ApplicationStageLog.create(
        {
          applicationId,
          fromStageId: application.currentStage.id,
          toStageId: nextStage.id,
          changedBy: userId,
          changedByType: "ADMIN",
          oldStatus: application.currentStage.name,
          newStatus: nextStage.name,
        },
        { transaction },
      );
    }

    await transaction.commit();

    const html = nextRoundSelectedEmailTemplate({
      candidateName: application.candidate.email,
      jobTitle: application.jobPosting.title,
      nextStageName: nextStage.name,
    });
    await sendMail(
      application.candidate.email,
      "Congratulations! You've advanced to the next stage",
      html,
    );

    return {
      success: true,
      message: "Application moved to next stage successfully.",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
