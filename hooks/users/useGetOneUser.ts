// hooks/users/useGetUserById.ts
import { useState, useEffect } from "react";
import { UsersService, UserResponse } from "@/services/users/users.service";

export const useGetOneUser = (id: number | undefined) => {
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setData(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await UsersService.getUserById(id);
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Error al obtener el usuario")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return {
    data,
    loading,
    error,
  };
};
