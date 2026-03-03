import {
  Application,
  ApplicationStageLog,
  Candidate,
  HiringStage,
  JobPosting,
  JobRequisition,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sequelize } from "../../config/db.js";
import { Op } from "sequelize";
import {
  generateRejectedEmail,
  generateShortlistedEmail,
  jobApplicationReceivedEmailTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import app from "../../app.js";

export const registerApplication = async (slug, data) => {
  const transaction = await sequelize.transaction();
  try {
    let candidate = await Candidate.findOne({
      where: { email: data.email },
      transaction,
    });

    data.contact = Number(data.contact);
    data.totalExperience = Number(data.totalExperience);
    data.expectedCTC = Number(data.expectedCTC);

    if (!candidate) {
      candidate = await Candidate.create(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          contact: Number(data.contact),
          currentCompany: data.currentCompany,
          totalExperience: data.totalExperience,
          expectedCTC: data.expectedCTC,
          linkedInUrl: data.linkedInUrl,
          resumeUrl: data.resumeUrl,
        },
        { transaction },
      );
    }

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        candidate.set(key, data[key]);
      }
    });

    if (candidate.changed()) {
      await candidate.save({ transaction });
    }

    const jobPosting = await JobPosting.findOne({
      where: { slug: slug },
      transaction,
    });

    if (
      !jobPosting ||
      jobPosting.isActive === false ||
      (jobPosting.expiresAt && jobPosting.expiresAt < new Date())
    ) {
      throw new ExpressError(STATUS.NOT_FOUND, "No job posting found");
    }

    const id = jobPosting.id;

    const application = await Application.findOne({
      where: {
        candidateId: candidate.id,
        jobPostingId: id,
      },
      transaction,
    });

    if (application) {
      return {
        success: false,
        message: "You have already applied for this job",
        status: STATUS.NOT_ACCEPTABLE,
      };
    }

    const firstStage = await HiringStage.findOne({
      where: {
        jobPostingId: id,
        isDefault: true,
      },
      transaction,
    });

    if (!firstStage) {
      throw new Error("Hiring stage not configured.");
    }

    const newApplication = await Application.create(
      {
        candidateId: candidate.id,
        jobPostingId: id,
        currentStageId: firstStage.id,
        status: "ACTIVE",
      },
      { transaction },
    );

    await transaction.commit();

    const html = jobApplicationReceivedEmailTemplate({
      firstName: candidate.firstName,
      companyName: "Orvane Digitals",
      jobTitle: jobPosting.title,
    });

    sendMail(candidate.email, "Application Received - Orvane Digitals", html);

    return {
      success: true,
      data: newApplication.jobPostingId,
      message: "Application created successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getApplications = async (query) => {
  try {
    const { jobId, stageId, status, search } = query;

    const pageNumber = Math.max(parseInt(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);

    const offset = (pageNumber - 1) * pageSize;
    const whereClause = {};

    if (jobId) whereClause.jobPostingId = jobId;
    const stageFilter = stageId ? { name: stageId } : null;
    if (status) whereClause.status = status;

    const candidateFilter = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : null;

    const jobFilter = search
      ? {
          slug: { [Op.like]: `%${search}%` },
        }
      : null;

    const applications = await Application.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "contact",
            "resumeUrl",
          ],
          ...(candidateFilter && { where: candidateFilter }),
        },
        {
          model: HiringStage,
          as: "currentStage",
          attributes: ["id", "name", "stageOrder"],
          ...(stageFilter && { where: stageFilter }),
        },
        {
          model: JobPosting,
          as: "jobPosting",
          attributes: ["id", "title", "slug"],
          ...(jobFilter && { where: jobFilter }),
        },
      ],
      offset,
      limit: pageSize,
      order: [["updatedAt", "DESC"]],
      distinct: true,
    });

    return {
      success: true,
      data: {
        rows: applications.rows,
        total: applications.count,
        page: pageNumber,
        totalPages: Math.ceil(applications.count / pageSize),
      },
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getApplicationById = async (id) => {
  try {
    const application = await Application.findOne({
      where: { id: id },
      include: [
        {
          model: Candidate,
          as: "candidate",
        },
        {
          model: HiringStage,
          as: "currentStage",
          attributes: ["id", "name", "stageOrder"],
        },
        {
          model: JobPosting,
          as: "jobPosting",
          include: [
            {
              model: HiringStage,
              as: "stages",
            },
            {
              model: JobRequisition,
              as: "requisition",
              attributes: [
                "id",
                "experienceMin",
                "experienceMax",
                "budgetMin",
                "budgetMax",
                "employmentType",
                "location",
                "headCount",
              ],
            },
          ],
        },
      ],
    });

    if (!application) {
      throw new ExpressError(STATUS.NOT_FOUND, "Application not found");
    }

    return {
      success: true,
      data: application,
      message: "Application fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const shortlistApplication = async (id, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const application = await Application.findOne({
      where: { id: id },
      include: [
        {
          model: HiringStage,
          as: "currentStage",
          attributes: ["id", "name", "stageOrder"],
        },
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
    });

    if (!application || application.currentStage.name != "Applied") {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Can not shortlist this application",
      );
    }

    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: application.jobPostingId,
        stageOrder: application.currentStage.stageOrder + 1,
      },
    });

    if (!nextStage) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Next hiring stage not configured",
      );
    }

    await application.update({ currentStageId: nextStage.id }, { transaction });

    await ApplicationStageLog.create(
      {
        applicationId: application.id,
        fromStageId: application.currentStage.id,
        toStageId: nextStage.id,
        changedBy: userId,
        changedByType: "ADMIN",
        oldStatus: "Applied",
        newStatus: nextStage.name,
      },
      { transaction },
    );

    await transaction.commit();

    const html = generateShortlistedEmail({
      candidateName:
        application?.candidate?.email?.split("@")[0] ||
        application?.candidate?.firstName,
      jobTitle: application?.jobPosting?.title,
      companyName: "Orvane Digitals",
    });

    sendMail(
      application.candidate.email,
      "Application Shortlisted - Orvane Digitals",
      html,
    );

    return {
      success: true,
      message: "Application shortlisted successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectApplication = async (id, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const application = await Application.findOne({
      where: {
        id: id,
        status: {
          [Op.notIn]: ["REJECTED", "WITHDRAWN", "HIRED", "OFFERED"],
        },
      },
      include: [
        {
          model: HiringStage,
          as: "currentStage",
          attributes: ["id", "name", "stageOrder"],
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
    if (!application) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Application not found or already rejected",
      );
    }

    const currentStage = application.currentStage;

    if (
      currentStage.isOfferStage ||
      currentStage.isRejectStage ||
      currentStage.isFinal
    ) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Current application stage cannot be rejected",
      );
    }

    const rejectStage = application.jobPosting.stages.find(
      (stage) => stage.isRejectStage === true,
    );

    if (!rejectStage) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Reject stage not configured");
    }

    await application.update(
      {
        currentStageId: rejectStage.id,
        status: "REJECTED",
      },
      { transaction },
    );

    await ApplicationStageLog.create(
      {
        applicationId: application.id,
        fromStageId: currentStage.id,
        toStageId: rejectStage.id,
        changedBy: userId,
        chandegedByType: "ADMIN",
        oldStatus: currentStage.name,
        newStatus: rejectStage.name,
      },
      { transaction },
    );

    await transaction.commit();

    const html = generateRejectedEmail({
      candidateName:
        application?.candidate?.email?.split("@")[0] ||
        application?.candidate?.firstName,
      jobTitle: application?.jobPosting?.title,
      companyName: "Orvane Digitals",
    });

    sendMail(
      application.candidate.email,
      "Application Rejected - Orvane Digitals",
      html,
    );

    return {
      success: true,
      message: "Application rejected successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
