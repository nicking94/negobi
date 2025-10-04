// hooks/clients/useGetClient.ts - Versión mejorada
import { useState, useEffect } from "react";
import { Client } from "@/app/dashboard/masters/clients/page";
import { ClientsService } from "@/services/clients/clients.service";
import { ApiError } from "@/types";

interface UseGetClientProps {
  id: string;
  enabled?: boolean;
}

export const useGetOneClient = ({ id, enabled = true }: UseGetClientProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!id || !enabled) return;

    const fetchClient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await ClientsService.getClient(id);

        if (response.status === 200) {
          setClient(response.data.data);
        } else {
          setError({ message: "Cliente no encontrado", status: 404 });
        }
      } catch (err: any) {
        const apiError: ApiError = {
          response: {
            data: {
              message:
                err.response?.data?.message || "Error al obtener el cliente",
            },
            status: err.response?.status,
          },
          message: err.message,
        };
        setError(apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, enabled]);

  const refetch = async () => {
    if (!id || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ClientsService.getClient(id);

      if (response.status === 200) {
        setClient(response.data.data);
      } else {
        setError({ message: "Cliente no encontrado", status: 404 });
      }
    } catch (err: any) {
      const apiError: ApiError = {
        response: {
          data: {
            message:
              err.response?.data?.message || "Error al obtener el cliente",
          },
          status: err.response?.status,
        },
        message: err.message,
      };
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    client,
    isLoading,
    error,
    refetch,
  };
};

export default useGetOneClient;
