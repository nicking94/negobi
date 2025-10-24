// hooks/users/useUserRoles.ts - ACTUALIZADO
import { useState, useEffect } from "react";
import {
  UsersService,
  UserRolesResponse,
} from "@/services/users/users.service";
import { useUserCompany } from "@/hooks/auth/useUserCompany";

export const useUserRoles = () => {
  const [data, setData] = useState<UserRolesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isSuperAdmin, isAdmin } = useUserCompany();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await UsersService.getUserRoles();

        setData(response);
      } catch (err) {
        console.error("❌ Error fetching roles:", err);
        setError(
          err instanceof Error ? err : new Error("Error al obtener los roles")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Función para filtrar roles según permisos del usuario actual
  const getFilteredRoles = (allRoles: string[]): string[] => {
    if (isSuperAdmin) {
      // SuperAdmin puede ver todos los roles
      return allRoles;
    } else if (isAdmin) {
      // Admin (directive) puede ver todos los roles EXCEPTO superAdmin y directive
      return allRoles.filter(
        (role) => role !== "superAdmin" && role !== "directive"
      );
    } else {
      // Otros roles solo pueden ver roles básicos (excluir superAdmin, directive, management)
      const restrictedRoles = ["superAdmin", "directive", "management"];
      return allRoles.filter((role) => !restrictedRoles.includes(role));
    }
  };

  return {
    data,
    loading,
    error,
    getFilteredRoles,
  };
};
