import { describe, expect, it } from "vitest";
import { isAuthorizedProfile } from "./authPolicy";

describe("isAuthorizedProfile", () => {
  it("allows supported roles only when the account is approved", () => {
    expect(isAuthorizedProfile({ role: "ADMIN", status: "APPROVED" })).toBe(true);
    expect(isAuthorizedProfile({ role: "TEACHER", status: "APPROVED" })).toBe(true);
    expect(isAuthorizedProfile({ role: "STUDENT", status: "APPROVED" })).toBe(true);
    expect(isAuthorizedProfile({ role: "PARENT", status: "APPROVED" })).toBe(true);
  });

  it("denies pending, rejected, missing and unsupported profiles", () => {
    expect(isAuthorizedProfile({ role: "ADMIN", status: "PENDING" })).toBe(false);
    expect(isAuthorizedProfile({ role: "STUDENT", status: "REJECTED" })).toBe(false);
    expect(isAuthorizedProfile({ role: "VOLUNTEER", status: "APPROVED" })).toBe(false);
    expect(isAuthorizedProfile(null)).toBe(false);
    expect(isAuthorizedProfile(undefined)).toBe(false);
  });
});
