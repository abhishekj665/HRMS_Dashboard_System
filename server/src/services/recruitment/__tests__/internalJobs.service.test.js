import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Op } from "sequelize";

const transaction = { commit: jest.fn(), rollback: jest.fn(), finished: undefined };
const models = {
  Application: { findOne: jest.fn(), create: jest.fn() },
  Candidate: { findOne: jest.fn(), create: jest.fn() },
  Department: {},
  HiringStage: { findOne: jest.fn() },
  JobPosting: { findAll: jest.fn(), findOne: jest.fn() },
  JobRequisition: {},
  Referral: { create: jest.fn() },
  User: { findOne: jest.fn() },
};
const sequelize = { transaction: jest.fn() };
const sendMail = jest.fn();

jest.unstable_mockModule("../../../models/Associations.model.js", () => models);
jest.unstable_mockModule("../../../config/db.js", () => ({ sequelize }));
jest.unstable_mockModule("../../../config/otpService.js", () => ({ sendMail }));
jest.unstable_mockModule("../../../utils/mailTemplate.utils.js", () => ({
  internalReferralEmailTemplate: jest.fn(() => "<html>profile received</html>"),
}));

const { submitReferral, getInternalJobPosts, getInternalJobPost } = await import("../internalJobs.service.js");

const setupTransaction = () => {
  transaction.commit.mockResolvedValue(undefined);
  transaction.rollback.mockResolvedValue(undefined);
  transaction.finished = undefined;
  sequelize.transaction.mockResolvedValue(transaction);
};

const validJob = { id: "job-1", slug: "engineer", title: "Engineer" };

beforeEach(() => {
  jest.clearAllMocks();
  setupTransaction();
  models.User.findOne.mockResolvedValue({ id: "employee-1" });
  models.JobPosting.findOne.mockResolvedValue(validJob);
  models.Candidate.findOne.mockResolvedValue(null);
  models.Candidate.create.mockResolvedValue({ id: "candidate-1" });
  models.Application.findOne.mockResolvedValue(null);
  models.HiringStage.findOne.mockResolvedValue({ id: "stage-applied" });
  models.Application.create.mockResolvedValue({ id: "application-1" });
  models.Referral.create.mockResolvedValue({ id: "referral-1" });
  sendMail.mockResolvedValue(undefined);
});

describe("internal job listings", () => {
  test("returns open jobs for both visibilities when no filter is given", async () => {
    models.JobPosting.findAll.mockResolvedValue([validJob]);
    const result = await getInternalJobPosts({ id: "employee-1", tenantId: "tenant-1" });

    expect(result.data).toEqual([validJob]);
    expect(models.JobPosting.findAll).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  test("rejects invalid visibility and users without a tenant", async () => {
    await expect(getInternalJobPost({ id: "employee-1", tenantId: "tenant-1" }, "engineer", "PRIVATE"))
      .rejects.toMatchObject({ statusCode: 400 });
    await expect(getInternalJobPosts({ id: "employee-1" }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test("returns a tenant scoped detail and rejects a missing job", async () => {
    models.JobPosting.findOne.mockResolvedValueOnce(validJob);
    await expect(getInternalJobPost({ id: "employee-1", tenantId: "tenant-1" }, "engineer"))
      .resolves.toMatchObject({ data: validJob });

    models.JobPosting.findOne.mockResolvedValueOnce(null);
    await expect(getInternalJobPost({ id: "employee-1", tenantId: "tenant-1" }, "missing"))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("submitReferral", () => {
  const user = { id: "employee-1", tenantId: "tenant-1" };
  const payload = {
    candidateName: "Jordan Lee",
    candidateEmail: " JORDAN@example.com ",
    candidatePhone: "+1 555 123 4567",
    note: "Strong backend experience",
  };

  test("creates candidate, application, referral and sends the candidate email", async () => {
    const result = await submitReferral(user, "engineer", payload, "https://files.example/resume.pdf");

    expect(models.Candidate.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-1",
      firstName: "Jordan",
      lastName: "Lee",
      email: "jordan@example.com",
      resumeUrl: "https://files.example/resume.pdf",
      source: "EMPLOYEE_REFERRAL",
    }), { transaction });
    expect(models.Application.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-1",
      candidateId: "candidate-1",
      jobPostingId: "job-1",
      currentStageId: "stage-applied",
      referredByEmployeeId: "employee-1",
      remark: "Strong backend experience",
    }), { transaction });
    expect(models.Referral.create).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: "candidate-1",
      referredById: "employee-1",
      status: "PENDING",
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(
      "jordan@example.com",
      expect.stringContaining("profile has been received"),
      "<html>profile received</html>",
    );
    expect(result.success).toBe(true);
    expect(models.JobPosting.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ visibility: { [Op.in]: ["INTERNAL", "EXTERNAL"] } }),
      transaction,
    }));
  });

  test("accepts referrals for external job postings too", async () => {
    models.JobPosting.findOne.mockResolvedValue({ ...validJob, visibility: "EXTERNAL" });

    const result = await submitReferral(user, "engineer", payload, "https://files.example/resume.pdf");

    expect(result.success).toBe(true);
    expect(models.Application.create).toHaveBeenCalledWith(expect.objectContaining({ jobPostingId: "job-1" }), { transaction });
    expect(models.Referral.create).toHaveBeenCalled();
  });

  test("updates an existing candidate profile before creating a referral application", async () => {
    const candidate = {
      id: "candidate-existing",
      lastName: "Old name",
      contact: 5551112222,
      source: "CAREER_PAGE",
      update: jest.fn().mockResolvedValue(undefined),
    };
    models.Candidate.findOne.mockResolvedValue(candidate);

    await submitReferral(user, "engineer", payload, "https://files.example/resume.pdf");

    expect(candidate.update).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "Jordan",
      lastName: "Lee",
      resumeUrl: "https://files.example/resume.pdf",
      source: "CAREER_PAGE",
    }), { transaction });
    expect(models.Candidate.create).not.toHaveBeenCalled();
    expect(models.Application.create).toHaveBeenCalledWith(expect.objectContaining({ candidateId: candidate.id }), { transaction });
  });

  test("does not create a referral or email when the candidate already applied", async () => {
    models.Candidate.findOne.mockResolvedValue({ id: "candidate-1", update: jest.fn().mockResolvedValue(undefined), contact: 5551234567 });
    models.Application.findOne.mockResolvedValue({ id: "existing-application" });

    await expect(submitReferral(user, "engineer", payload, "https://files.example/resume.pdf"))
      .rejects.toMatchObject({ statusCode: 406 });
    expect(transaction.rollback).toHaveBeenCalled();
    expect(models.Referral.create).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  test("rolls back if the default hiring stage is missing", async () => {
    models.HiringStage.findOne.mockResolvedValue(null);

    await expect(submitReferral(user, "engineer", payload, "https://files.example/resume.pdf"))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(transaction.rollback).toHaveBeenCalled();
    expect(models.Application.create).not.toHaveBeenCalled();
  });

  test("rejects a job that is no longer open", async () => {
    models.JobPosting.findOne.mockResolvedValue(null);
    await expect(submitReferral(user, "closed-role", payload, "https://files.example/resume.pdf"))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(transaction.rollback).toHaveBeenCalled();
    expect(models.Candidate.create).not.toHaveBeenCalled();
  });

  test("rejects requests from users not found in their tenant", async () => {
    models.User.findOne.mockResolvedValue(null);

    await expect(submitReferral(user, "engineer", payload, "https://files.example/resume.pdf"))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(transaction.rollback).toHaveBeenCalled();
    expect(models.JobPosting.findOne).not.toHaveBeenCalled();
  });

  test("keeps the saved referral successful if the email provider fails", async () => {
    const emailError = new Error("Email provider unavailable");
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValue(emailError);

    try {
      const result = await submitReferral(user, "engineer", payload, "https://files.example/resume.pdf");
      await new Promise((resolve) => setImmediate(resolve));

      expect(result.success).toBe(true);
      expect(transaction.commit).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith("REFERRAL CONFIRMATION EMAIL ERROR:", emailError.message);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
