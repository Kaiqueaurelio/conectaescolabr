import { Navigate } from "react-router-dom";

/**
 * Legacy alternate dashboard now redirects to the maintained dashboard, so
 * the application never presents the former hard-coded demo metrics.
 */
export function AdminDashboardSkillPathPage() {
  return <Navigate to="/admin/dashboard" replace />;
}

export default AdminDashboardSkillPathPage;
