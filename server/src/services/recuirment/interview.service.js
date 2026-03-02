import {
  User,
  Interview,
  Application,
  HiringStage,
  JobPosting,
  Candidate,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import {
  generateInterviewAssignmentEmail,
  generateCandidateInterviewEmail,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { sequelize } from "../../config/db.js";
import dayjs from "dayjs";
import { Op } from "sequelize";

export const getInterviewers = async () => {
  try {
    const interviewers = await User.findAll({
      where: {
        role: "manager",
      },
      attributes: ["id", "email"],
    });

    if (!interviewers)
      throw new ExpressError(STATUS.NOT_FOUND, "No interviewers found");

    return {
      success: true,
      data: interviewers,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const assignInterview = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const interviewer = await User.findByPk(data.interviewerId);

    const application = await Application.findOne({
      where: { id: data.applicationId },
      include: [
        {
          model: HiringStage,
          as: "currentStage",
          attributes: [
            "id",
            "name",
            "stageOrder",
            "isRejectStage",
            "isOfferStage",
            "isFinal",
            "isDefault",
          ],
        },
        {
          model: JobPosting,
          as: "jobPosting",
          attributes: ["id", "title", "slug"],
          include: [
            {
              model: HiringStage,
              as: "stages",
            },
          ],
        },
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!application)
      throw new ExpressError(STATUS.NOT_FOUND, "Application not found");

    if (application.currentStage.isDefault) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Only shortlisted application can be scheduled",
      );
    }

    if (
      application.currentStage.isRejectStage ||
      application.currentStage.isOfferStage ||
      application.currentStage.isFinal ||
      application.jobPosting?.expiresAt?.getTime() < Date.now()
    )
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Can not schedule interview Application already rejected",
      );

    if (!interviewer)
      throw new ExpressError(STATUS.NOT_FOUND, "Interviewer not found");

    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: application.jobPostingId,
        stageOrder: application.currentStage.stageOrder + 1,
        isRejectStage: { [Op.not]: true },
        isOfferStage: { [Op.not]: true },
        isFinal: { [Op.not]: true },
      },
    });

    if (!nextStage)
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Next hiring stage not configured",
      );

    const newStart = dayjs(data.scheduledAt);
    const newEnd = newStart.add(data.duration, "minute");

    const conflict = await Interview.findOne({
      where: {
        interviewerId: interviewer.id,
        status: {
          [Op.in]: ["PENDING_CONFIRMATION", "CONFIRMED"],
        },
        [Op.and]: [
          {
            scheduledAt: {
              [Op.lt]: newEnd.toDate(),
            },
          },
          sequelize.literal(`
        DATE_ADD(scheduledAt, INTERVAL duration MINUTE) > '${newStart.toDate().toISOString()}'
      `),
        ],
      },
    });

    if (conflict) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Interview already scheduled at this time",
      );
    }

    const interview = await Interview.create(
      {
        interviewerId: interviewer.id,
        ...data,
        roundName: nextStage.name,
        applicationId: application.id,
      },
      { transaction },
    );

    await transaction.commit();

    const formattedDate = dayjs(interview.scheduledAt).format("DD MMM YYYY");
    const formattedTime = dayjs(interview.scheduledAt).format("hh:mm A");

    const html = generateInterviewAssignmentEmail({
      interviewerName: interviewer.email.split("@")[0],
      candidateName:
        application?.candidate?.email?.split("@")[0] ||
        application?.candidate?.firstName,
      jobTitle: application?.jobPosting?.title,
      companyName: "Orvane Digitals",
      interviewDate: formattedDate,
      interviewTime: formattedTime,
      duration: interview.duration,
      roundName: interview.roundName,
      mode: interview.mode,
      meetingLink: interview.meetingUrl,
      location: interview.location,
      //   acceptUrl: interview.acceptUrl,
      //   declineUrl: interview.declineUrl,
      //   rescheduleUrl: interview.rescheduleUrl
    });

    sendMail(interviewer.email, "Interview Assigned - Orvane Digitals", html);

    return {
      success: true,
      message: "Interview scheduled successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getInterviews = async (interviewerId, data) => {
  try {
    const { page = 1, limit = 10, status, search, fromDate, toDate } = data;

    const offset = (page - 1) * limit;

    const where = {
      interviewerId: interviewerId,
    };

    if (status) {
      where.status = status;
    }

    if (fromDate && toDate) {
      where.scheduledAt = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    } else if (fromDate) {
      where.scheduledAt = {
        [Op.gte]: new Date(fromDate),
      };
    } else if (toDate) {
      where.scheduledAt = {
        [Op.lte]: new Date(toDate),
      };
    }

    let applicationWhere = {};
    if (search) {
      applicationWhere = {
        [Op.or]: [
          {
            "$application.candidate.firstName$": { [Op.iLike]: `%${search}%` },
          },
          { "$application.candidate.lastName$": { [Op.iLike]: `%${search}%` } },
          { "$application.jobPosting.title$": { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const { rows, count } = await Interview.findAndCountAll({
      where,
      include: [
        {
          model: Application,
          as: "application",
          required: true,
          where: applicationWhere,
          include: [
            {
              model: Candidate,
              as: "candidate",
              attributes: ["id", "firstName", "lastName", "email"],
            },
            {
              model: JobPosting,
              as: "jobPosting",
              attributes: ["id", "title", "slug"],
            },
          ],
        },
      ],
      order: [["scheduledAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    return {
      success: true,
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        rows,
      },
      message: "Interviews fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const confirmInterview = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const interview = await Interview.findOne({
      where: { id },
      include: [
        {
          model: Application,
          as: "application",
          include: [
            { model: Candidate, as: "candidate", attributes: ["id", "email"] },
            { model: JobPosting, as: "jobPosting", attributes: ["title"] },
            {
              model: HiringStage,
              as: "currentStage",
              attributes: [
                "name",
                "stageOrder",
                "isRejectStage",
                "isOfferStage",
                "isFinal",
                "isDefault",
              ],
            },
          ],
        },
      ],
      transaction,
      lock: true,
    });

    if (!interview)
      throw new ExpressError(STATUS.NOT_FOUND, "Interview not found");

    if (interview.status !== "PENDING_CONFIRMATION")
      throw new ExpressError(STATUS.BAD_REQUEST, "Interview already processed");

    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: interview.application.jobPostingId,
        stageOrder: interview.application.currentStage.stageOrder + 1,
        isRejectStage: { [Op.not]: true },
        isDefault: { [Op.not]: true },
        isFinal: { [Op.not]: true },
        isOfferStage: { [Op.not]: true },
      },
    });

    if (!nextStage)
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Next hiring stage not configured",
      );

    const application = interview.application;

    await application.update({ currentStageId: nextStage.id }, { transaction });

    await interview.update({ status: "CONFIRMED" }, { transaction });

    await transaction.commit();

    const html = generateCandidateInterviewEmail({
      candidateName: interview.application.candidate.email.split("@")[0],
      jobTitle: interview.application.jobPosting.title,
      companyName: "Orvane Digitals",
      interviewDate: dayjs(interview.scheduledAt).format("DD MMM YYYY"),
      interviewTime: dayjs(interview.scheduledAt).format("hh:mm A"),
      duration: interview.duration,
      roundName: interview.application.currentStage.name,
      mode: interview.mode,
      meetingLink: interview.meetingUrl,
      location: interview.location,
    });

    sendMail(
      interview.application.candidate.email,
      "Interview Confirmed - Orvane Digitals",
      html,
    );

    return {
      success: true,
      message: "Interview confirmed successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
