type SupabaseUserLike = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

export type AppRole = "employer" | "candidate";

const employerRoles = new Set(["admin", "recruiter", "hiring_manager", "employer"]);

export function resolveAppRole(user: SupabaseUserLike | null | undefined): AppRole {
  const appRole =
    typeof user?.app_metadata?.role === "string" ? user.app_metadata.role.toLowerCase() : "";
  const userRole =
    typeof user?.user_metadata?.role === "string" ? user.user_metadata.role.toLowerCase() : "";
  const role = appRole || userRole;

  if (employerRoles.has(role)) {
    return "employer";
  }

  return "candidate";
}
