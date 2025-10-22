// hooks/clients/useAddClient.ts - CORREGIDO COMPLETAMENTE
import { useState } from "react";
import { Client } from "@/app/dashboard/masters/clients/page";
import { ClientsService } from "@/services/clients/clients.service";
import { ApiError } from "@/types";

interface UseCreateClientProps {
  onSuccess?: (client: Client) => void;
  onError?: (error: ApiError) => void;
}

// ✅ SOLO UNA DEFINICIÓN con parámetros opcionales
const useAddClient = ({ onSuccess, onError }: UseCreateClientProps = {}) => {
  // ← = {} aquí es crucial
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Client | null>(null);

  const createClient = async (clientData: Omit<Client, "id">) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ClientsService.addClient(clientData as Client);

      if (response.status === 201) {
        const newClient = response.data.data;
        setData(newClient);
        onSuccess?.(newClient);
        return newClient;
      } else {
        throw new Error("Error al crear el cliente");
      }
    } catch (err: any) {
      const apiError: ApiError = {
        response: {
          data: {
            message: err.response?.data?.message || "Error al crear el cliente",
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
    createClient,
    isLoading,
    error,
    data,
    reset,
  };
};

export default useAddClient;
