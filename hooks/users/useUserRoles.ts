// hooks/users/useUserRoles.ts - CORREGIDO
import { useState, useEffect, useMemo } from "react";
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
  }, []); // Array de dependencias vacío para que solo se ejecute una vez

  // CORRECCIÓN: Usar useMemo para filtrar roles
  const getFilteredRoles = useMemo(() => {
    return (allRoles: string[]): string[] => {
      if (isSuperAdmin) {
        return allRoles;
      } else if (isAdmin) {
        return allRoles.filter(
          (role) => role !== "superAdmin" && role !== "directive"
        );
      } else {
        const restrictedRoles = ["superAdmin", "directive", "management"];
        return allRoles.filter((role) => !restrictedRoles.includes(role));
      }
    };
  }, [isSuperAdmin, isAdmin]); // Dependencias específicas

  return {
    data,
    loading,
    error,
    getFilteredRoles,
  };
};
