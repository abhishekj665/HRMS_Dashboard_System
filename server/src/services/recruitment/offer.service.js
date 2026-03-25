import STATUS from "../../constants/Status.js";
import {
  Offer,
  Application,
  ApplicationStageLog,
  HiringStage,
  JobPosting,
  Candidate,
  User,
  JobRequisition,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { sequelize } from "../../config/db.js";
import { generatePDF } from "../../utils/generatePDF.utils.js";
import { env } from "../../config/env.js";
import {
  offerEmailTemplate,
  offerLetterTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { uploadPDF } from "../../utils/generatePDF.utils.js";
import crypto from "crypto";
import { generateHash } from "../../utils/hash.utils.js";

export const createOffer = async (applicationId, data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: HiringStage,
          as: "currentStage",
        },
        {
          model: JobPosting,
          as: "jobPosting",
        },
        {
          model: Candidate,
          as: "candidate",
          attributes: ["email"],
        },
      ],
    });

    if (!application) {
      throw new ExpressError(STATUS.NOT_FOUND, "Application not found");
    }

    if (data.offeredCTC <= 0) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Offered CTC must be greater than 0",
      );
    }

    if (data.joiningDate && new Date(data.joiningDate) < new Date()) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Joining date cannot be in the past",
      );
    }

    const nextStage = await HiringStage.findOne({
      where: {
        jobPostingId: application.jobPostingId,
        isOfferStage: true,
      },
    });

    if (nextStage) {
      await application.update(
        { currentStageId: nextStage.id },
        { transaction },
      );
    }

    await application.update(
      {
        status: "OFFERED",
        currentStageId: nextStage?.id || application.currentStage.id,
      },
      { transaction },
    );

    await ApplicationStageLog.create(
      {
        applicationId,
        changedBy: userId,
        changedByType: "ADMIN",
        oldStatus: application.currentStage.name,
        newStatus: "OFFERED",
        fromStageId: application.currentStage.id,
        toStageId: application.currentStage.id,
      },
      { transaction },
    );

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const offer = await Offer.create(
      {
        applicationId,
        offeredBy: userId,
        ...data,
        offerDate: new Date(),
        status: "SENT",
        sentAt: new Date(),
        remark: data.remark,
        token: token,
        expiresAt: expiresAt,
      },
      { transaction },
    );

    const pdfHtml = offerLetterTemplate({
      application,
      offer,
    });

    const pdfBuffer = await generatePDF(pdfHtml);

    await offer.save({ transaction });

    const pdfUrl = await uploadPDF(pdfBuffer);

    const emailHtml = offerEmailTemplate({
      candidateName: application.candidate.email.split("@")[0] || "Candidate",
      jobTitle: application.jobPosting.title,
      companyName: "Orvane Digitals",
      pdfUrl,
      offerUrl: `${env.offer_url}/${token}`,
    });

    const base64PDF = Buffer.from(pdfBuffer).toString("base64");

    await sendMail(
      application.candidate.email,
      `Offer Letter – ${application.jobPosting.title} | Orvane Digitals`,
      emailHtml,
      [
        {
          filename: "Offer-Letter.pdf",
          content: base64PDF,
        },
      ],
    );

    await transaction.commit();

    return {
      success: true,
      message: "Offer sent successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const validateOfferToken = async (token) => {
  const transaction = await sequelize.transaction();
  try {
    const offer = await Offer.findOne({
      where: {
        token,
        status: "SENT",
      },
      include: [
        {
          model: Application,
          as: "application",
          include: [
            {
              model: JobPosting,
              as: "jobPosting",
              include: [
                {
                  model: JobRequisition,
                  as: "requisition",
                  attributes: ["id", "title", "headCount", "departmentId"],
                },
              ],
            },
            {
              model: Candidate,
              as: "candidate",
              attributes: ["email"],
            },
            {
              model: HiringStage,
              as: "currentStage",
              attributes: ["name", "id"],
            },
          ],
        },
      ],
    });

    if (!offer) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Invalid token");
    }

    if (offer.tokenUsed) {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Response Already Taken for this Job Offer",
      );
    }

    if (offer.expiresAt < new Date()) {
      throw new ExpressError(STATUS.BAD_REQUEST, "Offer has expired");
    }

    if (offer.approvalStatus !== "PENDING") {
      throw new ExpressError(
        STATUS.BAD_REQUEST,
        "Offer has already been processed",
      );
    }

    await offer.update(
      {
        tokenUsed: true,
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        respondedAt: new Date(),
      },
      { transaction },
    );

    await offer.application.update(
      {
        status: "HIRED",
      },
      { transaction },
    );

    const jobRequisition = offer.application.jobPosting.requisition;

    await jobRequisition.update(
      {
        headCount: jobRequisition.headCount - 1,
      },
      { transaction },
    );

    const jobPosting = offer.application.jobPosting;

    await jobPosting.update(
      {
        isActive: true,
      },
      { transaction },
    );

    const password = "Welcome@123";
    const hashPassword = await generateHash(password);

    const existingUser = await User.findOne({
      where: { email: offer.application.candidate.email },
      transaction,
    });

    if (existingUser) {
      await existingUser.update(
        {
          role: "employee",
          isVerified: true,
          password: hashPassword,
        },
        { transaction },
      );

      await transaction.commit();

    

      return {
        success: true,
        message: "Offer accepted successfully",

        data: {
          email: offer.application.candidate.email,
          password: "Existing user, please use your credentials",
        },
      };
    }

    const newUser = await User.create(
      {
        email: offer.application.candidate.email,
        password: hashPassword,
        role: "employee",
        isVerified: true,
      },
      { transaction },
    );

    await ApplicationStageLog.create(
      {
        applicationId: offer.applicationId,
        changedByType: "CANDIDATE",
        oldStatus: offer.application.currentStage.name,
        newStatus: "HIRED",
        fromStageId: offer.application.currentStage.id,
        toStageId: offer.application.currentStage.id,
        changedBy: newUser.id,
        changedByType: "CANDIDATE",
      },
      { transaction },
    );

    await transaction.commit();

    return {
      success: true,
      message: "Offer accepted successfully",
      data: {
        email: offer.application.candidate.email,
        password,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
