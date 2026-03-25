import ExpressError from "../../utils/Error.utils.js";
import { sequelize } from "../../config/db.js";
import {
  HiringStage,
  JobPosting,
  JobRequisition,
} from "../../models/Associations.model.js";
import STATUS from "../../constants/Status.js";
import { Op } from "sequelize";
import { getScopedWhere, requireTenantId } from "../../utils/tenant.utils.js";
import {
  findOrganizationByPublicSlug,
  getOrganizationPublicSlug,
} from "../../utils/organization.utils.js";
import { Organization } from "../../models/Associations.model.js";

export const updateJobPosting = async (id, data, user) => {
  const transaction = await sequelize.transaction();
  try {
    const jobPosting = await JobPosting.findOne({
      where: getScopedWhere(user, { id }),
    });

    if (!jobPosting)
      throw new ExpressError(STATUS.NOT_FOUND, "No job posting found");

    if(data.expiresAt && new Date(data.expiresAt) < new Date()){
      throw new ExpressError(STATUS.BAD_REQUEST, "Expiration date cannot be in the past");
    }

    await jobPosting.update({ ...data, editedBy: user.id }, { transaction });

    await transaction.commit();

    return {
      success: true,
      data: jobPosting,
      message: "Job posting updated successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getJobPosting = async (id, user) => {
  try {
    
    const jobPosting = await JobPosting.findOne({
      where: getScopedWhere(user, { id }),
    });

    if (!jobPosting)
      throw new ExpressError(STATUS.NOT_FOUND, "No job posting found");

    return {
      success: true,
      data: jobPosting,
      message: "Job posting fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getJobPostings = async (user) => {
  try {
    const jobPostings = await JobPosting.findAll({
      where: { tenantId: requireTenantId(user) },
      order: [["createdAt", "DESC"]],
    });
    if (!jobPostings)
      throw new ExpressError(STATUS.NOT_FOUND, "No job postings found");

    return {
      success: true,
      data: jobPostings,
      message: "Job postings fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const activeJobPosting = async (id, user) => {
  try {
    const jobPosting = await JobPosting.findOne({
      where: getScopedWhere(user, { id }),
    });

    if (!jobPosting)
      throw new ExpressError(STATUS.NOT_FOUND, "No job posting found");

    if (jobPosting.isActive) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Job posting is already active",
      );
    }

    await jobPosting.update({ isActive: true, editedBy: user.id });

    return {
      success: true,
      data: jobPosting,
      message: "Job posting activated successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getJobs = async () => {
  try {
    const jobs = await JobPosting.findAll({
      where: {
        isActive: true,
        visibility: "EXTERNAL",
        [Op.or]: [
          { expiresAt: { [Op.gt]: new Date() } },
          { expiresAt: { [Op.is]: null } },
        ],
      },
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "publishedAt",
        "expiresAt",
      ],
      order: [["publishedAt", "DESC"]],

      include: [
        {
          model: JobRequisition,
          as: "requisition",
          attributes: [
            "employmentType",
            "location",
            "experienceMin",
            "experienceMax",
            "budgetMin",
            "budgetMax",
            "priority",
            "title",
            "headCount",
            "departmentId",
          ],
        },
        {
          model: Organization,
          as: "organization",
          attributes: ["id", "name", "domain"],
        },
      ],
    });

    if (!jobs) throw new ExpressError(STATUS.NOT_FOUND, "No jobs found");

    return {
      success: true,
      data: jobs.map((job) => {
        const jobData = job.toJSON();

        return {
          ...jobData,
          orgSlug: getOrganizationPublicSlug(jobData.organization),
        };
      }),
      message: "Jobs fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getJob = async (orgSlug, slug) => {
  try {
    const organization = await findOrganizationByPublicSlug(orgSlug);

    if (!organization) throw new ExpressError(STATUS.NOT_FOUND, "No job found");

    const job = await JobPosting.findOne({
      where: {
        tenantId: organization.id,
        slug: slug,
        isActive: true,
        visibility: "EXTERNAL",
        [Op.or]: [
          { expiresAt: { [Op.gt]: new Date() } },
          { expiresAt: { [Op.is]: null } },
        ],
      },
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "publishedAt",
        "externalUrl",
        "expiresAt",
        "createdAt",
      ],
      include: [
        {
          model: JobRequisition,
          as: "requisition",
          attributes: [
            "id",
            "employmentType",
            "location",
            "experienceMin",
            "experienceMax",
            "budgetMin",
            "budgetMax",
            "priority",
            "title",
            "headCount",
            "departmentId",
          ],
        },
        {
          model: HiringStage,
          as: "stages",
          attributes: [
            "stageOrder",
            "name",
            "isFinal",
            "isRejectStage",
            "isOfferStage",
            "isDefault",
          ],
        },
        {
          model: Organization,
          as: "organization",
          attributes: ["id", "name", "domain"],
        },
      ],
      order: [[{ model: HiringStage, as: "stages" }, "stageOrder", "ASC"]],
    });

    if (!job) throw new ExpressError(STATUS.NOT_FOUND, "No job found");

    return {
      success: true,
      data: {
        ...job.toJSON(),
        orgSlug: getOrganizationPublicSlug(job.organization),
      },
      message: "Job fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
