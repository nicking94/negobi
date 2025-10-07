// hooks/users/useDeleteUser.ts
import { useState, useCallback } from "react";
import {
  UsersService,
  UserDeleteResponse,
} from "@/services/users/users.service";
import { ApiError } from "@/types";

interface UseDeleteUserProps {
  onSuccess?: (data: UserDeleteResponse) => void;
  onError?: (error: Error) => void;
  refetch?: () => void;
}

interface UseDeleteUserReturn {
  deleteUser: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: UserDeleteResponse | null;
  reset: () => void;
}

export const useDeleteUser = ({
  onSuccess,
  onError,
  refetch,
}: UseDeleteUserProps = {}): UseDeleteUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserDeleteResponse | null>(null);

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await UsersService.deleteUser(id);

        setData(response);
        onSuccess?.(response);
        refetch?.();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Error al eliminar el usuario";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, refetch]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    deleteUser,
    loading,
    error,
    data,
    reset,
  };
};
