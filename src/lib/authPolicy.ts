import type { UserProfile } from "@/lib/supabase";

const SUPPORTED_ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;

export function isAuthorizedProfile(
  profile: Pick<UserProfile, "role" | "status"> | null | undefined,
): boolean {
  return Boolean(
    profile &&
    profile.status === "APPROVED" &&
    SUPPORTED_ROLES.includes(profile.role as (typeof SUPPORTED_ROLES)[number])
  );
}
