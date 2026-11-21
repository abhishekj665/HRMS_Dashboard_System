import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Op } from "sequelize";

const transaction = { commit: jest.fn(), rollback: jest.fn(), finished: undefined };
const models = {
  Application: { findOne: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn() },
  ApplicationStageLog: { create: jest.fn() },
  Candidate: { findOne: jest.fn(), create: jest.fn() },
  HiringStage: { findOne: jest.fn() },
  Interview: {},
  JobPosting: { findOne: jest.fn() },
  JobRequisition: {},
  InterviewFeedback: {},
};
const sequelize = { transaction: jest.fn() };
const sendMail = jest.fn();
const jobApplicationReceivedEmailTemplate = jest.fn(() => "<html>application received</html>");
const generateRejectedEmail = jest.fn(() => "<html>rejected</html>");
const generateShortlistedEmail = jest.fn(() => "<html>shortlisted</html>");
const findOrganizationByPublicSlug = jest.fn();

jest.unstable_mockModule("../../../models/Associations.model.js", () => models);
jest.unstable_mockModule("../../../config/db.js", () => ({ sequelize }));
jest.unstable_mockModule("../../../config/otpService.js", () => ({ sendMail }));
jest.unstable_mockModule("../../../utils/mailTemplate.utils.js", () => ({
  generateRejectedEmail,
  generateShortlistedEmail,
  jobApplicationReceivedEmailTemplate,
}));
jest.unstable_mockModule("../../../app.js", () => ({ default: {} }));
jest.unstable_mockModule("../../../utils/organization.utils.js", () => ({ findOrganizationByPublicSlug }));

const {
  registerApplication,
  registerInternalApplication,
  getApplications,
  getApplicationById,
  shortlistApplication,
  rejectApplication,
} = await import("../application.service.js");

const user = { id: "employee-1", tenantId: "tenant-1" };
const payload = {
  firstName: "Alex",
  lastName: "Employee",
  email: " alex@example.com ",
  contact: "+1 (555) 123-4567",
  address: "1 Main Street",
  city: "Toronto",
  state: "Ontario",
  country: "Canada",
  currentCompany: "Acme",
  totalExperience: "5",
  currentCTC: "90000",
  expectedCTC: "110000",
  noticePeriodDays: "30",
  linkedInUrl: "https://linkedin.com/in/alex",
  portfolioUrl: "",
  resumeUrl: "https://files.example/alex-resume.pdf",
};

beforeEach(() => {
  jest.clearAllMocks();
  transaction.finished = undefined;
  transaction.commit.mockResolvedValue(undefined);
  transaction.rollback.mockResolvedValue(undefined);
  sequelize.transaction.mockResolvedValue(transaction);
  models.JobPosting.findOne.mockResolvedValue({ id: "job-1", title: "Engineer" });
  models.Candidate.findOne.mockResolvedValue(null);
  models.Candidate.create.mockResolvedValue({
    id: "candidate-1",
    firstName: "Alex",
    email: "alex@example.com",
  });
  models.Application.findOne.mockResolvedValue(null);
  models.HiringStage.findOne.mockResolvedValue({ id: "stage-applied" });
  models.Application.create.mockResolvedValue({ id: "application-1" });
  sendMail.mockResolvedValue(undefined);
  findOrganizationByPublicSlug.mockResolvedValue({ id: "tenant-1" });
  models.Application.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });
  models.ApplicationStageLog.create.mockResolvedValue({ id: "stage-log-1" });
});

describe("registerInternalApplication", () => {
  test("creates candidate and application in the tenant's default hiring stage", async () => {
    const result = await registerInternalApplication(user, "engineer", payload);

    expect(models.JobPosting.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: "tenant-1",
        slug: "engineer",
        visibility: { [Op.in]: ["INTERNAL", "EXTERNAL"] },
        isActive: true,
      }),
      transaction,
    }));
    expect(models.Candidate.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-1",
      firstName: "Alex",
      lastName: "Employee",
      email: "alex@example.com",
      contact: "15551234567",
      totalExperience: 5,
      currentCTC: 90000,
      expectedCTC: 110000,
      resumeUrl: payload.resumeUrl,
      source: "INTERNAL_EMPLOYEE",
    }), { transaction });
    expect(models.Application.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-1",
      candidateId: "candidate-1",
      jobPostingId: "job-1",
      currentStageId: "stage-applied",
      referredByEmployeeId: "employee-1",
      status: "ACTIVE",
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(
      "alex@example.com",
      "Application Received - Orvane Digitals",
      "<html>application received</html>",
    );
    expect(result).toMatchObject({ success: true, data: { id: "application-1" } });
  });

  test("accepts an external job posting for an employee application", async () => {
    models.JobPosting.findOne.mockResolvedValue({ id: "external-job", title: "Engineer", visibility: "EXTERNAL" });
    const result = await registerInternalApplication(user, "external-engineer", payload);

    expect(result.success).toBe(true);
    expect(models.Application.create).toHaveBeenCalledWith(expect.objectContaining({ jobPostingId: "external-job" }), { transaction });
  });

  test("rejects duplicate applications and rolls the transaction back", async () => {
    models.Candidate.findOne.mockResolvedValue({ id: "candidate-1", update: jest.fn().mockResolvedValue(undefined) });
    models.Application.findOne.mockResolvedValue({ id: "existing-application" });

    await expect(registerInternalApplication(user, "engineer", payload))
      .rejects.toMatchObject({ statusCode: 406 });
    expect(transaction.rollback).toHaveBeenCalled();
    expect(models.Application.create).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  test("rejects closed jobs and missing default stages", async () => {
    models.JobPosting.findOne.mockResolvedValue(null);
    await expect(registerInternalApplication(user, "closed-role", payload))
      .rejects.toMatchObject({ statusCode: 404 });

    models.JobPosting.findOne.mockResolvedValue({ id: "job-1", title: "Engineer" });
    models.HiringStage.findOne.mockResolvedValue(null);
    await expect(registerInternalApplication(user, "engineer", payload))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(transaction.rollback).toHaveBeenCalledTimes(2);
  });

  test("requires an organization tenant", async () => {
    await expect(registerInternalApplication({ id: "employee-1" }, "engineer", payload))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(sequelize.transaction).toHaveBeenCalled();
    expect(models.JobPosting.findOne).not.toHaveBeenCalled();
  });
});

describe("public application service workflows", () => {
  test("registers a public application with an existing hiring-stage workflow", async () => {
    const candidate = {
      id: "candidate-public",
      set: jest.fn(),
      changed: jest.fn(() => false),
      save: jest.fn(),
      firstName: "Taylor",
      email: "taylor@example.com",
    };
    const job = { id: "job-public", tenantId: "tenant-1", isActive: true, expiresAt: null, title: "Engineer" };
    models.JobPosting.findOne.mockResolvedValue(job);
    models.Candidate.create.mockResolvedValue(candidate);
    models.Application.findOne.mockResolvedValue(null);
    models.Application.create.mockResolvedValue({ id: "public-app", jobPostingId: job.id });

    const result = await registerApplication("acme", "engineer", {
      firstName: "Taylor",
      lastName: "Public",
      email: "taylor@example.com",
      contact: "5551234567",
      totalExperience: "3",
      expectedCTC: "100000",
      resumeUrl: "https://files.example/taylor.pdf",
    });

    expect(findOrganizationByPublicSlug).toHaveBeenCalledWith("acme", transaction);
    expect(models.Candidate.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-1",
      email: "taylor@example.com",
      resumeUrl: "https://files.example/taylor.pdf",
    }), { transaction });
    expect(models.Application.create).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: candidate.id,
      jobPostingId: job.id,
      currentStageId: "stage-applied",
      status: "ACTIVE",
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  test("rolls back when a public candidate has already applied", async () => {
    models.JobPosting.findOne.mockResolvedValue({ id: "job-public", tenantId: "tenant-1", isActive: true });
    models.Candidate.findOne.mockResolvedValue({ id: "candidate-public", set: jest.fn(), changed: jest.fn(() => false) });
    models.Application.findOne.mockResolvedValue({ id: "already-applied" });

    const result = await registerApplication("acme", "engineer", {
      email: "taylor@example.com", contact: 5551234567, totalExperience: 3, expectedCTC: 100000,
    });

    expect(result).toMatchObject({ success: false, status: 406 });
    expect(transaction.rollback).toHaveBeenCalled();
    expect(models.Application.create).not.toHaveBeenCalled();
  });

  test("lists applications with tenant scope and bounded pagination", async () => {
    const rows = [{ id: "app-1" }];
    models.Application.findAndCountAll.mockResolvedValue({ rows, count: 21 });

    const result = await getApplications({ jobId: "job-1", stageId: "Applied", status: "ACTIVE", search: "Taylor", page: "2", limit: "500" }, user);

    expect(models.Application.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: "tenant-1", jobPostingId: "job-1", status: "ACTIVE" },
      offset: 100,
      limit: 100,
      distinct: true,
    }));
    expect(result.data).toEqual({ rows, total: 21, page: 2, totalPages: 1 });
  });

  test("fetches application details and returns not found for unknown IDs", async () => {
    models.Application.findOne.mockResolvedValueOnce({ id: "app-1" });
    await expect(getApplicationById("app-1", user)).resolves.toMatchObject({
      success: true,
      data: { id: "app-1" },
    });

    models.Application.findOne.mockResolvedValueOnce(null);
    await expect(getApplicationById("missing", user)).rejects.toMatchObject({ statusCode: 404 });
  });

  test("moves an applied candidate to the next stage and records the stage log", async () => {
    const application = {
      id: "app-1",
      jobPostingId: "job-1",
      currentStage: { id: "stage-applied", name: "Applied", stageOrder: 1 },
      candidate: { id: "candidate-1", email: "taylor@example.com", firstName: "Taylor" },
      jobPosting: { title: "Engineer" },
      update: jest.fn().mockResolvedValue(undefined),
    };
    models.Application.findOne.mockResolvedValue(application);
    models.HiringStage.findOne.mockResolvedValue({ id: "stage-screen", name: "Screening" });

    const result = await shortlistApplication("app-1", user);

    expect(application.update).toHaveBeenCalledWith({ currentStageId: "stage-screen" }, { transaction });
    expect(models.ApplicationStageLog.create).toHaveBeenCalledWith(expect.objectContaining({
      applicationId: "app-1",
      fromStageId: "stage-applied",
      toStageId: "stage-screen",
      changedBy: user.id,
      changedByType: "ADMIN",
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith("taylor@example.com", "Application Shortlisted - Orvane Digitals", "<html>shortlisted</html>");
    expect(result.success).toBe(true);
  });

  test("rejects an application and records the rejection stage", async () => {
    const application = {
      id: "app-1",
      currentStageId: "stage-review",
      currentStage: { id: "stage-review", name: "Review", isFinal: false, isOfferStage: false, isRejectStage: false },
      jobPostingId: "job-1",
      jobPosting: { title: "Engineer", stages: [{ id: "stage-rejected", name: "Rejected", isRejectStage: true }] },
      candidate: { id: "candidate-1", email: "taylor@example.com", firstName: "Taylor" },
      update: jest.fn().mockResolvedValue(undefined),
    };
    models.Application.findOne.mockResolvedValue(application);

    const result = await rejectApplication("app-1", user);

    expect(application.update).toHaveBeenCalledWith({ currentStageId: "stage-rejected", status: "REJECTED" }, { transaction });
    expect(models.ApplicationStageLog.create).toHaveBeenCalledWith(expect.objectContaining({
      applicationId: "app-1",
      fromStageId: "stage-review",
      toStageId: "stage-rejected",
      changedBy: user.id,
      changedByType: "ADMIN",
      newStatus: "Rejected",
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith("taylor@example.com", "Application Rejected - Orvane Digitals", "<html>rejected</html>");
    expect(result.success).toBe(true);
  });
});
