import { useState, useEffect } from "react";
import {
  UsersService,
  UserRolesResponse,
} from "@/services/users/users.service";

export const useUserRoles = () => {
  const [data, setData] = useState<UserRolesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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

  return {
    data,
    loading,
    error,
  };
};
