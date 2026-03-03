import STATUS from "../../constants/Status.js";
import ExpressError from "../../utils/Error.utils.js";
import {
  JobRequisition,
  JobPosting,
  HiringStage,
  User,
} from "../../models/Associations.model.js";
import { sequelize } from "../../config/db.js";
import { stages } from "../../utils/hiringStages.utils.js";
import {
  getJobRequisitionEmailTemplate,
  requisitionRejectionEmailTemplate,
  requisitionRequestApprovalEmailTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { getNumber } from "../../utils/calaculateTime.utils.js";

export const registerJobRequisition = async (data, userId) => {
  try {
    data.experienceMin = getNumber(data.experienceMin);
    data.experienceMax = getNumber(data.experienceMax);
    data.budgetMin = getNumber(data.budgetMin);
    data.budgetMax = getNumber(data.budgetMax);
    data.headCount = getNumber(data.headCount);
    if (
      !data.title ||
      !data.employmentType ||
      data.budgetMin > data.budgetMax ||
      data.experienceMin > data.experienceMax ||
      data.headCount < 1
    )
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "You have to send valid job requisition data",
      );

    data.departmentId =
      data.departmentId || "1b3f4a5c-6d7e-8f9a-b0c1-d2e3f4a5b6c7";

    const jobRequisition = await JobRequisition.create({
      ...data,
      departmentId: data.departmentId,
      status: "PENDING",
      createdBy: userId,
    });

    const html = getJobRequisitionEmailTemplate({
      ...data,
      id: "12345",
    });

    const admin = await User.findOne({
      where: { role: "admin" },
      attributes: ["email"],
    });

    sendMail(admin.email, "New Job Requisition Created", html);

    return {
      success: true,
      data: jobRequisition,
      message: "Job requisition created successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getJobRequisitions = async (user) => {
  try {
    const whereClause = user.role === "admin" ? {} : { createdBy: user.id };

    const jobRequisitions = await JobRequisition.findAll({
      where: whereClause,

      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!jobRequisitions)
      throw new ExpressError(STATUS.NOT_FOUND, "No job requisitions found");

    return {
      success: true,
      data: jobRequisitions,
      message: "Job requisitions fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getJobRequisition = async (id) => {
  try {
    const jobRequisition = await JobRequisition.findByPk(id);

    if (!jobRequisition)
      throw new ExpressError(STATUS.NOT_FOUND, "No job requisition found");

    return {
      success: true,
      data: jobRequisition,
      message: "Job requisition fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const updateJobRequisition = async (id, data) => {
  try {
    const jobRequisition = await JobRequisition.findByPk(id);

    if (!jobRequisition)
      throw new ExpressError(STATUS.NOT_FOUND, "No job requisition found");

    await jobRequisition.update(data);

    return {
      success: true,
      data: jobRequisition,
      message: "Job requisition updated successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const approveJobRequisition = async (id, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const jobRequisition = await JobRequisition.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "email"],
        },
      ],
      transaction,
    });

    if (!jobRequisition || jobRequisition.status != "PENDING")
      throw new ExpressError(STATUS.NOT_FOUND, "No job requisition found");

    await JobRequisition.update(
      {
        status: "APPROVED",
        approvedBy: userId,
        approvedAt: new Date(),
        remark: "Approved by admin",
      },
      { where: { id }, transaction },
    );

    const jobPosting = await JobPosting.create(
      {
        tenantId: jobRequisition.tenantId,
        requisitionId: jobRequisition.id,
        title: jobRequisition.title,
        description: jobRequisition.jobDescription,
        visibility: "INTERNAL",
        isActive: false,
        createdBy: userId,
      },
      { transaction },
    );

    const stage = stages.map((stage) => ({
      tenantId: jobPosting.tenantId,
      jobPostingId: jobPosting.id,
      name: stage.name,
      stageOrder: stage.stageOrder,
      isFinal: stage.isFinal,
      isRejectStage: stage.isRejectStage,
      isOfferStage: stage.isOfferStage,
      colorCode: stage.colorCode,
      autoMoveRule: stage.autoMoveRule,
      isDefault: stage.isDefault,
    }));

    await HiringStage.bulkCreate(stage, { transaction });

    await transaction.commit();

    const html = requisitionRequestApprovalEmailTemplate({
      title: jobRequisition.title,
      id: jobRequisition.id,
      location: jobRequisition.location,
      employmentType: jobRequisition.employmentType,
      experienceMin: jobRequisition.experienceMin,
      experienceMax: jobRequisition.experienceMax,
      budgetMin: jobRequisition.budgetMin,
      budgetMax: jobRequisition.budgetMax,
      headCount: jobRequisition.headCount,
      priority: jobRequisition.priority,
      approvedAt: jobRequisition.approvedAt,
      creator: jobRequisition.creator.email,
      requisitionId: jobRequisition.id,
    });

    

    sendMail(jobRequisition.creator.email, "Job requisition approved", html);

    return {
      success: true,
      data: jobRequisition,
      message: "Job requisition approved and Job posting created successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const rejectJobRequisition = async (id, remark, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const jobRequisition = await JobRequisition.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "email"],
        },
      ],
      transaction,
    });

    if (!jobRequisition || jobRequisition.status != "PENDING")
      throw new ExpressError(STATUS.NOT_FOUND, "No job requisition found");

    await JobRequisition.update(
      {
        status: "REJECTED",
        approvedBy: userId,
        approvedAt: new Date(),
        remark: remark,
      },
      { where: { id }, transaction },
    );

    await transaction.commit();

    const html = requisitionRejectionEmailTemplate({
      title: jobRequisition.title,
      id: jobRequisition.id,
      location: jobRequisition.location,
      employmentType: jobRequisition.employmentType,
      experienceMin: jobRequisition.experienceMin,
      experienceMax: jobRequisition.experienceMax,
      budgetMin: jobRequisition.budgetMin,
      budgetMax: jobRequisition.budgetMax,
      headCount: jobRequisition.headCount,
      priority: jobRequisition.priority,
      approvedAt: jobRequisition.approvedAt,
      creator: jobRequisition.creator.email,
      remark: remark,
      requisitionId: jobRequisition.id,
    });

    sendMail(jobRequisition.creator.email, "Job requisition rejected", html);

    return {
      success: true,
      data: jobRequisition,
      message: "Job requisition rejected successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
