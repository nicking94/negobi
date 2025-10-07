// hooks/users/useUpdateUser.ts
import { useState, useCallback } from "react";
import {
  UsersService,
  UpdateUserPayload,
  UserResponse,
} from "@/services/users/users.service";
import { ApiError } from "@/types";

interface UseUpdateUserProps {
  onSuccess?: (data: UserResponse) => void;
  onError?: (error: Error) => void;
  refetch?: () => void;
}

interface UseUpdateUserReturn {
  updateUser: (id: number, data: UpdateUserPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: UserResponse | null;
  reset: () => void;
}

export const useUpdateUser = ({
  onSuccess,
  onError,
  refetch,
}: UseUpdateUserProps = {}): UseUpdateUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserResponse | null>(null);

  const updateUser = useCallback(
    async (id: number, updateData: UpdateUserPayload) => {
      try {
        setLoading(true);
        setError(null);

        const response = await UsersService.updateUser(id, updateData);

        setData(response);
        onSuccess?.(response);
        refetch?.();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Error al actualizar el usuario";
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
    updateUser,
    loading,
    error,
    data,
    reset,
  };
};
