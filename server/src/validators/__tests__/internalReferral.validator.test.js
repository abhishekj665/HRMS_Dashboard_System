import { describe, expect, jest, test } from "@jest/globals";
import { validate } from "../../middlewares/validate.middleware.js";
import { internalApplicationSchema, internalReferralSchema } from "../internalReferral.validator.js";

const runValidation = (schema, body) => new Promise((resolve) => {
  const req = { body };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn(() => resolve({ req, res, next }));
  validate(schema)(req, res, next);
  if (!next.mock.calls.length) resolve({ req, res, next });
});

describe("internal job request validation", () => {
  test("accepts a valid referral and trims candidate fields", async () => {
    const { req, next } = await runValidation(internalReferralSchema, {
      candidateName: "  Jordan Lee  ",
      candidateEmail: " jordan@example.com ",
      candidatePhone: "+1 555 123 4567",
      note: " Strong experience ",
    });
    expect(next).toHaveBeenCalled();
    expect(req.body).toMatchObject({ candidateName: "Jordan Lee", candidateEmail: "jordan@example.com", note: "Strong experience" });
  });

  test.each([
    [{ candidateName: "Jordan Lee", candidateEmail: "not-an-email" }],
    [{ candidateName: "J", candidateEmail: "jordan@example.com" }],
    [{ candidateName: "Jordan Lee" }],
  ])("rejects invalid referral payload %j", async (body) => {
    const { res, next } = await runValidation(internalReferralSchema, body);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test("accepts complete employee application details and strips unrelated fields", async () => {
    const payload = {
      firstName: "Alex",
      lastName: "Employee",
      email: "alex@example.com",
      contact: "+1 555 123 4567",
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
      jobId: "ignored-client-id",
      ignored: "should be removed",
    };
    const { req, next } = await runValidation(internalApplicationSchema, payload);
    expect(next).toHaveBeenCalled();
    expect(req.body.totalExperience).toBe(5);
    expect(req.body.currentCTC).toBe(90000);
    expect(req.body.ignored).toBeUndefined();
  });

  test("does not allow client supplied resume URLs", async () => {
    const payload = {
      firstName: "Alex", lastName: "Employee", email: "alex@example.com",
      contact: "5551234567", address: "Main Street", city: "Toronto", state: "Ontario",
      country: "Canada", currentCompany: "Acme", totalExperience: "5", currentCTC: "1",
      expectedCTC: "2", noticePeriodDays: "1", linkedInUrl: "https://linkedin.com/in/alex",
      resumeUrl: "https://untrusted.example/resume.pdf",
    };
    const { res, next } = await runValidation(internalApplicationSchema, payload);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
