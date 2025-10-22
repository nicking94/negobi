// hooks/auth/usePermissions.ts
import { useAuth } from "@/context/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();

  const canCreateBranch = () => {
    if (!user?.role) return false;

    // Roles que pueden crear sucursales
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

    // Solo superAdmin y directive pueden eliminar
    const allowedRoles = ["superAdmin", "directive"];
    return allowedRoles.includes(user.role);
  };

  const canToggleBranchStatus = () => {
    if (!user?.role) return false;

    const allowedRoles = ["superAdmin", "directive", "management"];
    return allowedRoles.includes(user.role);
  };

  return {
    canCreateBranch,
    canEditBranch,
    canDeleteBranch,
    canToggleBranchStatus,
    userRole: user?.role,
  };
};
