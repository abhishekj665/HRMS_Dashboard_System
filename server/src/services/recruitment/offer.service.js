import STATUS from "../../constants/Status.js";
import {
  Offer,
  Application,
  ApplicationStageLog,
  HiringStage,
  JobPosting,
  Candidate,
  User,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import { sequelize } from "../../config/db.js";
import { generatePDF } from "../../utils/generatePDF.utils.js";
import {
  offerEmailTemplate,
  offerLetterTemplate,
} from "../../utils/mailTemplate.utils.js";
import { sendMail } from "../../config/otpService.js";
import { uploadPDF } from "../../utils/generatePDF.utils.js";

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
      throw new ExpressError("Application not found", STATUS.NOT_FOUND);
    }

    if (data.offeredCTC <= 0) {
      throw new ExpressError(
        "Offered CTC must be greater than 0",
        STATUS.BAD_REQUEST,
      );
    }

    if (data.joiningDate && new Date(data.joiningDate) < new Date()) {
      throw new ExpressError(
        "Joining date cannot be in the past",
        STATUS.BAD_REQUEST,
      );
    }

    const offer = await Offer.create(
      {
        applicationId,
        offeredBy: userId,
        ...data,
        offerDate: new Date(),
        status: "SENT",
        sentAt: new Date(),
        remark: data.remark,
      },
      { transaction },
    );

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

    const pdfHtml = offerLetterTemplate({
      application,
      offer,
    });

    const pdfBuffer = await generatePDF(pdfHtml);

    const pdfUrl = await uploadPDF(pdfBuffer);

    offer.offerLaterUrl = pdfUrl;
    await offer.save({ transaction });

    const emailHtml = offerEmailTemplate({
      candidateName: application.candidate.email.split("@")[0] || "Candidate",
      jobTitle: application.jobPosting.title,
      companyName: "Orvane Digitals",
      pdfUrl,
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
