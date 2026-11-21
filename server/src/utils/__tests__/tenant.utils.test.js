import { describe, expect, test } from "@jest/globals";
import { Op } from "sequelize";
import {
  assertSameTenant,
  getScopedWhere,
  getTenantIdFromUser,
  getTenantOrGlobalWhere,
  requireTenantId,
} from "../tenant.utils.js";
import ExpressError from "../Error.utils.js";

describe("tenant scoping utilities", () => {
  test("reads and requires the current tenant", () => {
    expect(getTenantIdFromUser({ tenantId: "tenant-1" })).toBe("tenant-1");
    expect(getTenantIdFromUser(null)).toBeNull();
    expect(requireTenantId({ tenantId: "tenant-1" })).toBe("tenant-1");
    expect(() => requireTenantId({})).toThrow(ExpressError);
  });

  test("builds tenant and global scopes without losing caller filters", () => {
    expect(getScopedWhere({ tenantId: "tenant-1" }, { id: "record-1" })).toEqual({
      id: "record-1",
      tenantId: "tenant-1",
    });
    expect(getScopedWhere({ tenantId: "tenant-1" })).toEqual({ tenantId: "tenant-1" });
    expect(getTenantOrGlobalWhere("tenant-1", { isActive: true })).toEqual({
      isActive: true,
      [Op.or]: [{ tenantId: "tenant-1" }, { tenantId: null }],
    });
    expect(getTenantOrGlobalWhere("tenant-1")).toEqual({
      [Op.or]: [{ tenantId: "tenant-1" }, { tenantId: null }],
    });
  });

  test("asserts tenant ownership and permits global records", () => {
    const ownRecord = { id: "record-1", tenantId: "tenant-1" };
    const globalRecord = { id: "global-record", tenantId: null };
    expect(assertSameTenant(ownRecord, "tenant-1")).toBe(ownRecord);
    expect(assertSameTenant(globalRecord, "tenant-1")).toBe(globalRecord);
    expect(() => assertSameTenant(null, "tenant-1", "Job")).toThrow("Job not found");
    expect(() => assertSameTenant(ownRecord, "tenant-2", "Job")).toThrow("Job does not belong to your organization");
  });
});

describe("ExpressError", () => {
  test("classifies client and server errors", () => {
    expect(new ExpressError(404, "Missing")).toMatchObject({ statusCode: 404, status: "fail", message: "Missing" });
    expect(new ExpressError(500, "Broken")).toMatchObject({ statusCode: 500, status: "error", message: "Broken" });
  });
});
