import { describe, expect, it } from "vitest";
import { isAuthorizedProfile } from "./authPolicy";

describe("isAuthorizedProfile", () => {
  it("allows only supported roles with approved accounts", () => {
    for (const role of ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const) {
      expect(isAuthorizedProfile({ role, status: "APPROVED" })).toBe(true);
    }
  });

  it("denies pending, rejected, unsupported, and missing profiles", () => {
    expect(isAuthorizedProfile({ role: "ADMIN", status: "PENDING" })).toBe(false);
    expect(isAuthorizedProfile({ role: "STUDENT", status: "REJECTED" })).toBe(false);
    expect(isAuthorizedProfile({ role: "VOLUNTEER", status: "APPROVED" })).toBe(false);
    expect(isAuthorizedProfile(null)).toBe(false);
    expect(isAuthorizedProfile(undefined)).toBe(false);
  });
});
