// hooks/clients/useUpdateClient.ts
import { useState } from "react";
import { Client } from "@/app/dashboard/masters/clients/page";
import { ClientsService } from "@/services/clients/clients.service";
import { ApiError } from "@/types";

interface UseUpdateClientProps {
  onSuccess?: (client: Client) => void;
  onError?: (error: ApiError) => void;
}

const useUpdateClient = ({ onSuccess, onError }: UseUpdateClientProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Client | null>(null);

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ClientsService.updateClient(id, clientData);

      if (response.status === 200) {
        const updatedClient = response.data.data;
        setData(updatedClient);
        onSuccess?.(updatedClient);
        return updatedClient;
      } else {
        throw new Error("Error al actualizar el cliente");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      const apiError: ApiError = {
        response: {
          data: {
            message:
              err.response?.data?.message || "Error al actualizar el cliente",
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
    setData(null);
  };

  return {
    updateClient,
    isLoading,
    error,
    data,
    reset,
  };
};
export default useUpdateClient;
