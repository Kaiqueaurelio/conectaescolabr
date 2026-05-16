import { UserProfile } from "@/lib/supabase";

export type Permission =
  | "view_dashboard"
  | "manage_users"
  | "manage_attendance"
  | "manage_benefits"
  | "manage_announcements"
  | "manage_events"
  | "manage_blog"
  | "view_reports"
  | "manage_inventory"
  | "view_student_profile"
  | "edit_student_profile"
  | "view_own_profile"
  | "edit_own_profile"
  | "view_children_info"
  | "view_attendance_reports"
  | "manage_activities"
  | "view_social_records"
  | "create_social_records"
  | "approve_users";

type RolePermissions = Record<UserProfile["role"], Permission[]>;

const ROLE_PERMISSIONS: RolePermissions = {
  ADMIN: [
    "view_dashboard",
    "manage_users",
    "manage_attendance",
    "manage_benefits",
    "manage_announcements",
    "manage_events",
    "manage_blog",
    "view_reports",
    "manage_inventory",
    "manage_activities",
    "view_social_records",
    "create_social_records",
    "approve_users",
  ],
  TEACHER: [
    "view_dashboard",
    "manage_attendance",
    "manage_announcements",
    "view_reports",
    "view_student_profile",
    "manage_activities",
    "view_social_records",
    "create_social_records",
  ],
  STUDENT: [
    "view_own_profile",
    "edit_own_profile",
    "view_attendance_reports",
  ],
  PARENT: [
    "view_own_profile",
    "edit_own_profile",
    "view_children_info",
    "view_attendance_reports",
  ],
  VOLUNTEER: [
    "view_dashboard",
    "view_student_profile",
    "view_attendance_reports",
    "view_social_records",
  ],
};

export function hasPermission(user: UserProfile | null, permission: Permission): boolean {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(user: UserProfile | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(user: UserProfile | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.every((p) => userPermissions.includes(p));
}

export function canViewUser(currentUser: UserProfile | null, targetUser: UserProfile | null): boolean {
  if (!currentUser || !targetUser) return false;

  // Admins can view anyone
  if (currentUser.role === "ADMIN") return true;

  // Users can view themselves
  if (currentUser.id === targetUser.id) return true;

  // Teachers can view students
  if (currentUser.role === "TEACHER" && targetUser.role === "STUDENT") return true;

  // Parents can view their children (would need to check relationship)
  if (currentUser.role === "PARENT") return true;

  return false;
}

export function canEditUser(currentUser: UserProfile | null, targetUser: UserProfile | null): boolean {
  if (!currentUser || !targetUser) return false;

  // Admins can edit anyone
  if (currentUser.role === "ADMIN") return true;

  // Users can edit themselves
  if (currentUser.id === targetUser.id) return true;

  return false;
}

export function getRoleLabel(role: UserProfile["role"]): string {
  const labels: Record<UserProfile["role"], string> = {
    ADMIN: "Administrador",
    TEACHER: "Professor",
    STUDENT: "Aluno",
    PARENT: "Responsável",
    VOLUNTEER: "Voluntário",
  };
  return labels[role];
}

export function getStatusLabel(status: UserProfile["status"]): string {
  const labels: Record<UserProfile["status"], string> = {
    PENDING: "Aguardando Aprovação",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
  };
  return labels[status];
}
