import type { UserProfile } from "@/lib/supabase";

/**
 * Only explicitly supported, approved roles may enter the application.
 * Keep this check centralized so auth guards and tests use the same policy.
 */
export function isAuthorizedProfile(
  profile: Pick<UserProfile, "role" | "status"> | null | undefined,
): boolean {
  if (!profile || profile.status !== "APPROVED") return false;

  return (
    profile.role === "ADMIN" ||
    profile.role === "TEACHER" ||
    profile.role === "STUDENT" ||
    profile.role === "PARENT"
  );
}
