import {
  Interview,
  InterviewAuditLog,
  InterviewFeedback,
  Application,
  ApplicationStageLog,
  HiringStage,
  Candidate,
  JobPosting,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import {
  interviewRejectionEmailTemplate,
  nextRoundSelectedEmailTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { act } from "react";

export const createInterviewFeedback = async (interviewId, data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      submittedBy = userId,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      recommendation,
      strength,
      weakness,
      remark,
    } = data;

    const interview = await Interview.findByPk(interviewId, {
      include: [
        {
          model: Application,
          as: "application",
          include: [
            {
              model: Candidate,
              as: "candidate",
              attributes: ["id", "email"],
            },
            {
              model: HiringStage,
              as: "currentStage",
            },
            {
              model: JobPosting,
              as: "jobPosting",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
      transaction,
    });

    if (!interview) {
      throw new Error("Interview not found.");
    }

    if (interview.interviewerId !== submittedBy) {
      throw new Error(
        "You are not authorized to submit feedback for this interview.",
      );
    }

    const allowedStatuses = ["SCHEDULED", "RESCHEDULED"];

    if (!allowedStatuses.includes(interview.status)) {
      throw new Error("Feedback cannot be submitted for this interview.");
    }
    // if (interview.scheduledAt > new Date()) {
    //   throw new Error(
    //     "Feedback cannot be submitted before the interview is conducted.",
    //   );
    // }

    const feedback = await InterviewFeedback.findOne({
      where: { interviewId, isSubmitted: true },
      transaction,
    });

    if (feedback) {
      throw new Error(
        "Feedback for this interview has already been submitted.",
      );
    }

    await InterviewFeedback.create(
      {
        interviewId,
        submittedBy,
        technicalScore,
        communicationScore,
        problemSolvingScore,
        recommendation,
        strength,
        weakness,
        remark,
        isSubmitted: true,
      },
      { transaction },
    );

    await InterviewAuditLog.create(
      {
        interviewId,
        action: "COMPLETED",
        performedBy: submittedBy,
        interviewerId: userId,
        details: `Interview completed and feedback submitted. Recommendation: ${recommendation}`,
      },
      { transaction },
    );

    if (recommendation === "REJECT") {
      await Application.update(
        { status: "REJECTED" },
        { where: { id: interview.applicationId }, transaction },
      );

      await ApplicationStageLog.create(
        {
          applicationId: interview.applicationId,
          newStatus: "REJECTED",
          remark: remark || "Application rejected based on interview feedback",
          fromStageId: interview.application.currentStageId,
          toStageId: interview.application.currentStageId,
          changedBy: submittedBy,
          changedByType: "INTERVIEWER",
        },
        {
          transaction,
        },
      );

      await Interview.update(
        { status: "COMPLETED" },
        { where: { id: interviewId }, transaction },
      );

      await InterviewAuditLog.create(
        {
          interviewId,
          action: "COMPLETED",
          performedBy: submittedBy,
          interviewerId: userId,
          details:
            "Interview feedback submitted and completed. Application rejected.",
        },
        { transaction },
      );

      const rejectStage = await HiringStage.findOne({
        where: {
          isRejectStage: true,
          jobPostingId: interview.application.jobPostingId,
        },
        transaction,
      });

      if (rejectStage) {
        await Application.update(
          { currentStageId: rejectStage.id },
          { where: { id: interview.applicationId }, transaction },
        );
      }

      await transaction.commit();

      const html = interviewRejectionEmailTemplate({
        candidateName:
          interview.application.candidate.email.split("@")[0] || "Candidate",
        jobTitle: interview.application.jobPosting.title,
        stageName: interview.application.currentStage.name,
      });
      sendMail(
        interview.application.candidate.email,
        "Update on your job application",
        html,
      );

      return {
        success: true,
        message: "Feedback submitted and application rejected successfully.",
      };
    }

    if (recommendation === "HOLD") {
      await Application.update(
        {
          status: "ON_HOLD",
          score: technicalScore + communicationScore + problemSolvingScore,
          rating: Math.round(
            (technicalScore + communicationScore + problemSolvingScore) / 3,
          ),
        },
        { where: { id: interview.applicationId }, transaction },
      );

      await ApplicationStageLog.create(
        {
          applicationId: interview.applicationId,
          newStatus: "ON_HOLD",
          remark: remark || "Application put on hold for admin review",
          fromStageId: interview.application.currentStageId,
          toStageId: interview.application.currentStageId,
          changedBy: submittedBy,
          changedByType: "INTERVIEWER",
        },
        { transaction },
      );
    }
    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: interview.application.jobPostingId,
        stageOrder: interview.application.currentStage.stageOrder + 1,
      },
      transaction,
    });

    if (recommendation === "HIRE" && nextStage) {
      await Application.update(
        { currentStageId: nextStage.id },
        { where: { id: interview.applicationId }, transaction },
      );

      await ApplicationStageLog.create(
        {
          applicationId: interview.applicationId,
          stageId: nextStage.id,
          changedBy: submittedBy,
          changedByType: "INTERVIEWER",
          remark:
            remark ||
            `Application moved to next stage (${nextStage.name}) based on interview feedback`,
          newStatus: "MOVED_TO_NEXT_STAGE",
          fromStageId: interview.application.currentStageId,
          toStageId: nextStage.id,
        },
        { transaction },
      );
    }

    await Interview.update(
      { status: "COMPLETED" },
      { where: { id: interviewId }, transaction },
    );

    await transaction.commit();

    if (recommendation === "HIRE" && nextStage) {
      const html = nextRoundSelectedEmailTemplate({
        candidateName:
          interview.application.candidate.email.split("@")[0] || "Candidate",
        jobTitle: interview.application.jobPosting.title,
        nextStageName: nextStage.name,
      });

      sendMail(
        interview.application.candidate.email,
        "Congratulations! You've selected to the next stage of the hiring process",
        html,
      );
    }

    return {
      message: "Feedback submitted successfully.",
      success: true,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
