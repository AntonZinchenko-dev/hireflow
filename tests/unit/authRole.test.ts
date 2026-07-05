import { describe, expect, it } from "vitest";
import { resolveAppRole } from "@/shared/lib/auth-role";

describe("resolveAppRole", () => {
  it("map employer roles from app_metadata", () => {
    expect(resolveAppRole({ app_metadata: { role: "admin" } })).toBe("employer");
    expect(resolveAppRole({ app_metadata: { role: "recruiter" } })).toBe("employer");
    expect(resolveAppRole({ app_metadata: { role: "hiring_manager" } })).toBe("employer");
    expect(resolveAppRole({ app_metadata: { role: "employer" } })).toBe("employer");
  });

  it("maps employer role from user_metadata", () => {
    expect(resolveAppRole({ user_metadata: { role: "employer" } })).toBe("employer");
  });

  it("prefers app_metadata over user_metadata", () => {
    expect(
      resolveAppRole({
        app_metadata: { role: "candidate" },
        user_metadata: { role: "employer" },
      })
    ).toBe("candidate");
  });

  it("falls back to candidate for unknown or missing role", () => {
    expect(resolveAppRole({ app_metadata: { role: "unknown" } })).toBe("candidate");
    expect(resolveAppRole({})).toBe("candidate");
    expect(resolveAppRole(undefined)).toBe("candidate");
    expect(resolveAppRole(null)).toBe("candidate");
  });
});
