// hooks/auth/usePermissions.ts
import { useAuth } from "@/context/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();

  const canAccessOrganizations = () => {
    return user?.role === "superAdmin";
  };

  const canAccessCompanies = () => {
    return user?.role === "superAdmin";
  };

  const canCreateBranch = () => {
    if (!user?.role) return false;
    const allowedRoles = ["superAdmin", "directive", "management"];
    return allowedRoles.includes(user.role);
  };

  const canEditBranch = () => {
    if (!user?.role) return false;
    const allowedRoles = ["superAdmin", "directive", "management"];
    return allowedRoles.includes(user.role);
  };

  const canDeleteBranch = () => {
    if (!user?.role) return false;
    const allowedRoles = ["superAdmin", "directive"];
    return allowedRoles.includes(user.role);
  };

  const canToggleBranchStatus = () => {
    if (!user?.role) return false;
    const allowedRoles = ["superAdmin", "directive", "management"];
    return allowedRoles.includes(user.role);
  };

  return {
    canAccessOrganizations,
    canAccessCompanies,
    canCreateBranch,
    canEditBranch,
    canDeleteBranch,
    canToggleBranchStatus,
    userRole: user?.role,
  };
};
