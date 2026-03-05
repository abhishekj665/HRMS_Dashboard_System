import {
  User,
  Interview,
  Application,
  HiringStage,
  JobPosting,
  Candidate,
  InterviewAuditLog,
  ApplicationStageLog,
  InterviewFeedback,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import {
  generateInterviewAssignmentEmail,
  generateCandidateInterviewEmail,
  getAdminInterviewDeclinedTemplate,
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

export const assignInterview = async (data, userId) => {
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

    const stage = application.currentStage;

    if (
      stage.isDefault ||
      stage.isRejectStage ||
      stage.isOfferStage ||
      stage.isFinal
    ) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Interview cannot be scheduled for this stage",
      );
    }

    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: application.jobPostingId,
        stageOrder: application.currentStage.stageOrder + 1,
        isRejectStage: { [Op.not]: true },
        isOfferStage: { [Op.not]: true },
        isFinal: { [Op.not]: true },
      },
    });

    const newStart = dayjs(data.scheduledAt);
    const newEnd = newStart.add(data.duration, "minute");

    const conflict = await Interview.findOne({
      where: {
        interviewerId: interviewer.id,
        status: {
          [Op.in]: ["PENDING_CONFIRMATION", "SCHEDULED"],
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

    const scheduledTime = new Date(data.scheduledAt);

    if (scheduledTime.getTime() < Date.now()) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Timing is not valid");
    }

    const interview = await Interview.create(
      {
        interviewerId: interviewer.id,
        ...data,
        roundName: nextStage?.name || application.currentStage.name,
        applicationId: application.id,
      },
      { transaction },
    );

    const interviewAuditLog = await InterviewAuditLog.create(
      {
        interviewId: interview.id,
        interviewerId: interviewer.id,
        action: "CREATED",
        performedBy: userId,
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
      order: [["createdAt", "DESC"]],
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
                "id",
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
      },
    });

    const application = interview.application;

    if (nextStage && !nextStage.isFinal && !nextStage.isOfferStage) {
      await application.update(
        { currentStageId: nextStage.id },
        { transaction },
      );

      await ApplicationStageLog.create(
        {
          applicationId: application.id,
          fromStageId: interview.application.currentStage.id,
          toStageId: nextStage.id,
          changedBy: interview.interviewerId,
          changedByType: "INTERVIEWER",
          oldStatus: interview.application.currentStage.name,
          newStatus: nextStage.name,
          autoMoved: true,
        },
        { transaction },
      );
    }
    await interview.update({ status: "SCHEDULED" }, { transaction });

    await transaction.commit();

    const html = generateCandidateInterviewEmail({
      candidateName:
        interview.application.candidate.firstName ||
        interview.application.candidate.email.split("@")[0],
      jobTitle: interview.application.jobPosting.title,
      companyName: "Orvane Digitals",
      interviewDate: dayjs(interview.scheduledAt).format("DD MMM YYYY"),
      interviewTime: dayjs(interview.scheduledAt).format("hh:mm A"),
      duration: interview.duration,
      roundName: nextStage?.name || interview.application.currentStage.name,
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
      message: "Interview Scheduled successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const declineAssignedInterview = async (id, remark, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const interview = await Interview.findOne({
      where: { id },
      include: [
        {
          model: Application,
          as: "application",
          include: [
            {
              model: HiringStage,
              as: "currentStage",
            },
            {
              model: Candidate,
              as: "candidate",
              attributes: ["id", "email"],
            },
            {
              model: JobPosting,
              as: "jobPosting",
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: User,
          as: "interviewer",
          attributes: ["id", "email"],
        },
      ],
      transaction,
      lock: true,
    });

    if (!interview)
      throw new ExpressError(STATUS.NOT_FOUND, "Interview not found");

    if (interview.status !== "PENDING_CONFIRMATION")
      throw new ExpressError(STATUS.BAD_REQUEST, "Interview already processed");

    await interview.update(
      { status: "DECLINED", remark: remark },
      { transaction },
    );

    await InterviewAuditLog.create(
      {
        interviewId: interview.id,
        interviewerId: interview.interviewerId,
        action: "DECLINED",
        performedBy: userId,
        remark: remark,
      },
      { transaction },
    );

    await transaction.commit();

    const admin = await User.findOne({
      where: { role: "admin" },
      attributes: ["email"],
    });

    const html = getAdminInterviewDeclinedTemplate({
      adminName: admin.email.split("@")[0],
      candidateName: interview.application.candidate.email.split("@")[0],
      jobTitle: interview.application.jobPosting.title,
      companyName: "Orvane Digitals",
      interviewDate: dayjs(interview.scheduledAt).format("DD MMM YYYY"),
      interviewTime: dayjs(interview.scheduledAt).format("hh:mm A"),
      interviewerName: interview.interviewer.email.split("@")[0],
      reason: remark,
    });

    sendMail(admin.email, "Interview Declined - Orvane Digitals", html);

    return {
      success: true,
      message: "Interview rejected successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getActiveInterview = async (id) => {
  try {
    const existingActive = await Interview.findOne({
      where: {
        applicationId: id,
        status: [
          "SCHEDULED",
          "PENDING_CONFIRMATION",
          "RESCHEDULED",
          "DECLINED",
        ],
      },
      include: [
        { model: User, as: "interviewer", attributes: ["id", "email", "role"] },
      ],
      order: [["updatedAt", "DESC"]],
      limit: 1,
    });

    if (!existingActive) {
      throw new Error("No active interview found");
    }

    if (existingActive.status === "DECLINED") {
      return {
        success: true,
        message: "Interview already declined",
        data: existingActive,
      };
    }

    return {
      success: true,
      data: existingActive,
      message: "Active Interviwe fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rescheduleInterview = async (id, data, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const interview = await Interview.findOne({
      where: {
        id,
        status: "PENDING_CONFIRMATION",
        interviewerId: userId,
      },
      include: [
        {
          model: Application,
          as: "application",
          include: [
            {
              model: HiringStage,
              as: "currentStage",
            },
            {
              model: JobPosting,
              as: "jobPosting",
              attributes: ["id", "title"],
            },
            {
              model: Candidate,
              as: "candidate",
              attributes: ["id", "email"],
            },
          ],
        },
        {
          model: User,
          as: "interviewer",
          attributes: ["id", "email"],
        },
      ],
      transaction,
      lock: true,
    });

    if (!interview) {
      throw new Error("No pending confirmation interview found");
    }

    const application = interview.application;

    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: application.jobPostingId,
        stageOrder: application.currentStage.stageOrder + 1,
      },
    });

    if (nextStage && !nextStage.isFinal && !nextStage.isOfferStage) {
      await Application.update(
        { currentStageId: nextStage.id },
        { where: { id: application.id }, transaction },
      );

      await ApplicationStageLog.create(
        {
          applicationId: application.id,
          fromStageId: application.currentStage.id,
          toStageId: nextStage.id,
          changedBy: userId,
          changedByType: "INTERVIEWER",
          oldStatus: application.currentStage.name,
          newStatus: nextStage.name,
          remark: data.remark,
        },
        { transaction },
      );
    }

    const scheduledTime = new Date(data.proposedScheduledAt);

    if (scheduledTime.getTime() < Date.now()) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Timing is not valid");
    }

    await interview.update(
      {
        remark: data.remark,
        scheduledAt: scheduledTime,
        rescheduledAt: scheduledTime,
        rescheduledBy: userId,
        status: "RESCHEDULED",
      },
      { transaction },
    );

    await InterviewAuditLog.create(
      {
        interviewId: interview.id,
        interviewerId: interview.interviewerId,
        action: "RESCHEDULED",
        performedBy: userId,
        oldScheduledAt: interview.scheduledAt,
        newScheduledAt: data.proposedScheduledAt,
        remark: data.remark,
      },
      { transaction },
    );

    await transaction.commit();

    const html = generateCandidateInterviewEmail({
      candidateName: interview.application?.candidate?.email?.split("@")[0],
      jobTitle: interview.application.jobPosting.title,
      companyName: "Orvane Digitals",
      interviewDate: interview.scheduledAt,
      interviewTime: interview.scheduledAt,
      duration: interview.duration,
      roundName: interview.roundName,
      mode: interview.mode,
      meetingLink: interview.meetingUrl,
      location: interview.location,
    });

    const admin = await User.findOne({
      where: { role: "admin" },
      attributes: ["email"],
    });

    const remark = data.remark || "No reason provided";

    const adminHtml = getAdminInterviewDeclinedTemplate({
      adminName: admin.email.split("@")[0],
      candidateName: interview.application.candidate.email.split("@")[0],
      jobTitle: interview.application.jobPosting.title,
      companyName: "Orvane Digitals",
      interviewDate: dayjs(interview.scheduledAt).format("DD MMM YYYY"),
      interviewTime: dayjs(interview.scheduledAt).format("hh:mm A"),
      interviewerName: interview.interviewer.email.split("@")[0],
      rescheduleLink: interview.meetingUrl,
      reason: remark,
    });

    sendMail(admin.email, "Interview Rescheduled - Orvane Digitals", adminHtml);

    sendMail(
      interview.application.candidate.email,
      "Interview Scheduled - Orvane Digitals",
      html,
    );

    return {
      success: true,
      message: "Interview rescheduled successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
