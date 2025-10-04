// hooks/clients/useDeleteClient.ts
import { useState } from "react";
import { ClientsService } from "@/services/clients/clients.service";
import { ApiError } from "@/types";

interface UseDeleteClientProps {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export const useDeleteClient = ({
  onSuccess,
  onError,
}: UseDeleteClientProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const deleteClient = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setIsDeleted(false);

    try {
      const response = await ClientsService.deleteClient(id);

      if (response.status === 200) {
        setIsDeleted(true);
        onSuccess?.();
        return response.data;
      } else {
        throw new Error("Error al eliminar el cliente");
      }
    } catch (err: any) {
      const apiError: ApiError = {
        response: {
          data: {
            message:
              err.response?.data?.message || "Error al eliminar el cliente",
          },
          status: err.response?.status,
        },
        message: err.message,
      };
      setError(apiError);
      onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsDeleted(false);
  };

  return {
    deleteClient,
    isLoading,
    error,
    isDeleted,
    reset,
  };
};

export default useDeleteClient;
