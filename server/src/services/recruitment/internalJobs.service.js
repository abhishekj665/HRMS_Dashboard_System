import { Op } from "sequelize";
import {
  Application,
  Candidate,
  Department,
  HiringStage,
  JobPosting,
  JobRequisition,
  Referral,
  User,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import { requireTenantId } from "../../utils/tenant.utils.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { sendMail } from "../../config/otpService.js";
import { internalReferralEmailTemplate } from "../../utils/mailTemplate.utils.js";

const getOpenJob = async (tenantId, slug, transaction) => {
  const job = await JobPosting.findOne({
    where: {
      tenantId,
      slug,
      isActive: true,
      visibility: { [Op.in]: ["INTERNAL", "EXTERNAL"] },
      [Op.or]: [{ expiresAt: { [Op.gt]: new Date() } }, { expiresAt: null }],
    },
    include: [
      {
        model: JobRequisition,
        as: "requisition",
        required: true,
        where: { headCount: { [Op.gt]: 0 } },
      },
    ],
    transaction,
  });

  if (!job)
    throw new ExpressError(STATUS.NOT_FOUND, "No open internal job found");
  return job;
};

const createApplication = async ({
  tenantId,
  candidate,
  job,
  referredByEmployeeId,
  remark,
  transaction,
}) => {
  const existing = await Application.findOne({
    where: { tenantId, candidateId: candidate.id, jobPostingId: job.id },
    transaction,
  });
  if (existing)
    throw new ExpressError(
      STATUS.NOT_ACCEPTABLE,
      "This candidate has already applied for this job",
    );

  const firstStage = await HiringStage.findOne({
    where: { tenantId, jobPostingId: job.id, isDefault: true },
    transaction,
  });
  if (!firstStage)
    throw new ExpressError(STATUS.BAD_REQUEST, "Hiring stage not configured");

  return Application.create(
    {
      tenantId,
      candidateId: candidate.id,
      jobPostingId: job.id,
      currentStageId: firstStage.id,
      referredByEmployeeId,
      remark,
      status: "ACTIVE",
    },
    { transaction },
  );
};

export const getInternalJobPosts = async (user, filter = {}) => {
  try {
    const tenantId = requireTenantId(user);
    const visibilityFilter =
      filter.visibility && ["INTERNAL", "EXTERNAL"].includes(filter.visibility)
        ? { visibility: filter.visibility }
        : { [Op.or]: [{ visibility: "INTERNAL" }, { visibility: "EXTERNAL" }] };
    const jobPostings = await JobPosting.findAll({
      where: {
        tenantId,
        isActive: true,
        [Op.and]: [
          visibilityFilter,
          {
            [Op.or]: [
              { expiresAt: { [Op.gt]: new Date() } },
              { expiresAt: null },
            ],
          },
        ],
      },
      attributes: [
        "id",
        "slug",
        "visibility",
        "expiresAt",
        "createdAt",
        "title",
      ],
      include: [
        {
          model: JobRequisition,
          as: "requisition",
          required: true,
          where: { headCount: { [Op.gt]: 0 } },
          attributes: ["id", "employmentType", "location", "departmentId"],
          include: [
            { model: Department, as: "department", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["publishedAt", "DESC"]],
    });
    return {
      success: true,
      data: jobPostings,
      message: "Job postings fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(
      error.statusCode || STATUS.BAD_REQUEST,
      error.message,
    );
  }
};

export const getInternalJobPost = async (user, slug, visibility) => {
  try {
    const tenantId = requireTenantId(user);
    if (visibility && !["INTERNAL", "EXTERNAL"].includes(visibility)) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Invalid job visibility");
    }
    const visibilityFilter = visibility
      ? { visibility }
      : { [Op.or]: [{ visibility: "INTERNAL" }, { visibility: "EXTERNAL" }] };
    const job = await JobPosting.findOne({
      where: {
        tenantId,
        slug,
        isActive: true,
        [Op.and]: [
          visibilityFilter,
          {
            [Op.or]: [
              { expiresAt: { [Op.gt]: new Date() } },
              { expiresAt: null },
            ],
          },
        ],
      },
      include: [
        {
          model: JobRequisition,
          as: "requisition",
          required: true,
          where: { headCount: { [Op.gt]: 0 } },
          include: [
            { model: Department, as: "department", attributes: ["id", "name"] },
          ],
        },
      ],
    });
    if (!job) throw new ExpressError(STATUS.NOT_FOUND, "No job found");
    return { success: true, data: job, message: "Job fetched successfully" };
  } catch (error) {
    throw new ExpressError(
      error.statusCode || STATUS.BAD_REQUEST,
      error.message,
    );
  }
};

export const submitReferral = async (user, jobSlug, data, resumeUrl) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = requireTenantId(user);
    const referrer = await User.findOne({
      where: { id: user.id, tenantId },
      transaction,
    });
    if (!referrer)
      throw new ExpressError(STATUS.NOT_FOUND, "Employee not found");
    const job = await getOpenJob(tenantId, jobSlug, transaction);
    const [firstName, ...lastNameParts] = data.candidateName
      .trim()
      .split(/\s+/);
    const email = data.candidateEmail.trim().toLowerCase();
    let candidate = await Candidate.findOne({
      where: { tenantId, email },
      transaction,
    });
    if (!candidate) {
      candidate = await Candidate.create(
        {
          tenantId,
          firstName,
          lastName: lastNameParts.join(" ") || "Not provided",
          email,
          contact:
            Number(String(data.candidatePhone || "").replace(/\D/g, "")) || 0,
          resumeUrl,
          source: "EMPLOYEE_REFERRAL",
        },
        { transaction },
      );
    } else {
      await candidate.update(
        {
          firstName,
          lastName: lastNameParts.join(" ") || candidate.lastName,
          contact:
            Number(String(data.candidatePhone || "").replace(/\D/g, "")) ||
            candidate.contact,
          resumeUrl,
          source: candidate.source || "EMPLOYEE_REFERRAL",
        },
        { transaction },
      );
    }
    const application = await createApplication({
      tenantId,
      candidate,
      job,
      referredByEmployeeId: referrer.id,
      remark: data.note?.trim() || null,
      transaction,
    });
    await Referral.create(
      {
        tenantId,
        candidateId: candidate.id,
        referredById: referrer.id,
        bonusAmount: 0,
        status: "PENDING",
        remarks: data.note?.trim() || `Referred for ${job.title}`,
      },
      { transaction },
    );
    await transaction.commit();

    const html = internalReferralEmailTemplate({
      candidateName: `${firstName} ${lastNameParts.join(" ")}`.trim(),
      jobTitle: job.title,
      companyName: "Orvane Digitals",
    });
    sendMail(
      email,
      "Your profile has been received - Orvane Digitals",
      html,
    ).catch((mailError) =>
      console.error("REFERRAL CONFIRMATION EMAIL ERROR:", mailError.message),
    );
    return {
      success: true,
      data: application,
      message: "Referral submitted successfully",
    };
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    throw new ExpressError(
      error.statusCode || STATUS.BAD_REQUEST,
      error.message,
    );
  }
};
