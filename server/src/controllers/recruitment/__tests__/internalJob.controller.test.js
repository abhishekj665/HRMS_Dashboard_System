import { beforeEach, expect, jest, test } from "@jest/globals";

const internalJobService = {
  getInternalJobPosts: jest.fn(),
  getInternalJobPost: jest.fn(),
  submitReferral: jest.fn(),
};
const applicationService = { registerInternalApplication: jest.fn() };
const cloudinary = { uploader: { upload: jest.fn() } };
const fs = { existsSync: jest.fn(), unlinkSync: jest.fn() };
const successResponse = jest.fn((_res, data, message, status) => ({ data, message, status }));
const errorResponse = jest.fn((_res, message, status) => ({ message, status }));

jest.unstable_mockModule("../../../services/recruitment/internalJobs.service.js", () => internalJobService);
jest.unstable_mockModule("../../../services/recruitment/application.service.js", () => applicationService);
jest.unstable_mockModule("../../../config/cloudinary.js", () => ({ default: cloudinary }));
jest.unstable_mockModule("fs", () => ({ default: fs }));
jest.unstable_mockModule("../../../utils/response.utils.js", () => ({ successResponse, errorResponse }));

const {
  getInternalJobPosts,
  getInternalJobPost,
  applyToInternalJob,
  submitReferral,
} = await import("../internalJob.controller.js");

beforeEach(() => {
  jest.clearAllMocks();
  cloudinary.uploader.upload.mockResolvedValue({ secure_url: "https://files.example/resume.pdf" });
  fs.existsSync.mockReturnValue(true);
  applicationService.registerInternalApplication.mockResolvedValue({ success: true, data: { id: "application-1" }, message: "Applied" });
  internalJobService.submitReferral.mockResolvedValue({ success: true, data: { id: "application-2" }, message: "Referred" });
});

test("uploads the employee resume, delegates application creation, and removes the temp file", async () => {
  const req = {
    user: { id: "employee-1", tenantId: "tenant-1" },
    params: { slug: "engineer" },
    body: { email: "alex@example.com" },
    file: { path: "C:/temp/resume.pdf" },
  };
  const next = jest.fn();

  await applyToInternalJob(req, {}, next);

  expect(cloudinary.uploader.upload).toHaveBeenCalledWith(req.file.path, {
    folder: "candidate-resumes",
    resource_type: "raw",
  });
  expect(applicationService.registerInternalApplication).toHaveBeenCalledWith(
    req.user,
    "engineer",
    expect.objectContaining({ email: "alex@example.com", resumeUrl: "https://files.example/resume.pdf" }),
  );
  expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
  expect(successResponse).toHaveBeenCalledWith({}, { id: "application-1" }, "Applied", 201);
  expect(next).not.toHaveBeenCalled();
});

test("returns internal job lists and details from their services", async () => {
  const listResponse = { success: true, data: [{ slug: "engineer" }], message: "Jobs" };
  const detailResponse = { success: true, data: { slug: "engineer" }, message: "Job" };
  internalJobService.getInternalJobPosts.mockResolvedValue(listResponse);
  internalJobService.getInternalJobPost.mockResolvedValue(detailResponse);
  const req = {
    user: { id: "employee-1", tenantId: "tenant-1" },
    params: { slug: "engineer" },
    query: { visibility: "EXTERNAL" },
  };

  await getInternalJobPosts(req, {}, jest.fn());
  await getInternalJobPost(req, {}, jest.fn());

  expect(successResponse).toHaveBeenNthCalledWith(1, {}, listResponse.data, "Jobs", 200);
  expect(internalJobService.getInternalJobPost).toHaveBeenCalledWith(req.user, "engineer", "EXTERNAL");
  expect(successResponse).toHaveBeenNthCalledWith(2, {}, detailResponse.data, "Job", 200);
});

test("forwards listing and detail service errors to Express error middleware", async () => {
  const error = new Error("Database unavailable");
  internalJobService.getInternalJobPosts.mockRejectedValue(error);
  internalJobService.getInternalJobPost.mockRejectedValue(error);
  const next = jest.fn();
  const req = { user: {}, params: { slug: "engineer" }, query: {} };

  await getInternalJobPosts(req, {}, next);
  await getInternalJobPost(req, {}, next);

  expect(next).toHaveBeenNthCalledWith(1, error);
  expect(next).toHaveBeenNthCalledWith(2, error);
});

test("returns service-level failures as bad requests", async () => {
  internalJobService.getInternalJobPosts.mockResolvedValue({ success: false, message: "Could not list jobs" });
  internalJobService.getInternalJobPost.mockResolvedValue({ success: false, message: "Could not load job" });
  applicationService.registerInternalApplication.mockResolvedValue({ success: false, message: "Application rejected" });
  internalJobService.submitReferral.mockResolvedValue({ success: false, message: "Referral rejected" });
  const req = {
    user: { id: "employee-1", tenantId: "tenant-1" },
    params: { slug: "engineer" },
    query: {},
    body: {},
    file: { path: "C:/temp/resume.pdf" },
  };

  await getInternalJobPosts(req, {}, jest.fn());
  await getInternalJobPost(req, {}, jest.fn());
  await applyToInternalJob(req, {}, jest.fn());
  await submitReferral(req, {}, jest.fn());

  expect(errorResponse).toHaveBeenNthCalledWith(1, {}, "Could not list jobs", 400);
  expect(errorResponse).toHaveBeenNthCalledWith(2, {}, "Could not load job", 400);
  expect(errorResponse).toHaveBeenNthCalledWith(3, {}, "Application rejected", 400);
  expect(errorResponse).toHaveBeenNthCalledWith(4, {}, "Referral rejected", 400);
});

test("rejects an apply request without a resume", async () => {
  const req = { file: undefined };
  await applyToInternalJob(req, {}, jest.fn());
  expect(errorResponse).toHaveBeenCalledWith({}, "A resume is required", 400);
  expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
});

test("rejects a referral without a resume", async () => {
  const req = { file: undefined };
  await submitReferral(req, {}, jest.fn());
  expect(errorResponse).toHaveBeenCalledWith({}, "A resume is required", 400);
  expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
});

test("forwards service failures and cleans up the uploaded referral file", async () => {
  const error = new Error("Referral persistence failed");
  internalJobService.submitReferral.mockRejectedValue(error);
  const req = {
    user: { id: "employee-1", tenantId: "tenant-1" },
    params: { slug: "engineer" },
    body: { candidateEmail: "jordan@example.com" },
    file: { path: "C:/temp/referral.pdf" },
  };
  const next = jest.fn();

  await submitReferral(req, {}, next);

  expect(next).toHaveBeenCalledWith(error);
  expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
});

test("uploads the referral resume, delegates referral creation, and removes the temp file", async () => {
  const req = {
    user: { id: "employee-1", tenantId: "tenant-1" },
    params: { slug: "engineer" },
    body: { candidateEmail: "jordan@example.com" },
    file: { path: "C:/temp/referral.pdf" },
  };
  const next = jest.fn();

  await submitReferral(req, {}, next);

  expect(internalJobService.submitReferral).toHaveBeenCalledWith(
    req.user,
    "engineer",
    req.body,
    "https://files.example/resume.pdf",
  );
  expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
  expect(successResponse).toHaveBeenCalledWith({}, { id: "application-2" }, "Referred", 201);
  expect(next).not.toHaveBeenCalled();
});

test("forwards upload failures to Express error middleware and still cleans up", async () => {
  const error = new Error("Cloud upload failed");
  cloudinary.uploader.upload.mockRejectedValue(error);
  const req = { file: { path: "C:/temp/broken.pdf" } };
  const next = jest.fn();

  await applyToInternalJob(req, {}, next);

  expect(next).toHaveBeenCalledWith(error);
  expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
});
