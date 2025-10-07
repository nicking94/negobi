// hooks/users/useCreateUser.ts
import { useState, useCallback } from "react";
import {
  UsersService,
  CreateUserPayload,
  UserResponse,
} from "@/services/users/users.service";
import { ApiError } from "@/types";

interface UseCreateUserProps {
  onSuccess?: (data: UserResponse) => void;
  onError?: (error: Error) => void;
  refetch?: () => void;
}

interface UseCreateUserReturn {
  createUser: (data: CreateUserPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: UserResponse | null;
  reset: () => void;
}

export const useCreateUser = ({
  onSuccess,
  onError,
  refetch,
}: UseCreateUserProps = {}): UseCreateUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserResponse | null>(null);

  const createUser = useCallback(
    async (payload: CreateUserPayload) => {
      try {
        setLoading(true);
        setError(null);

        const response = await UsersService.createUser(payload);

        setData(response);
        onSuccess?.(response);
        refetch?.();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Error al crear el usuario";
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
    createUser,
    loading,
    error,
    data,
    reset,
  };
};
