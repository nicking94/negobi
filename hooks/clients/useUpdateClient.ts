// hooks/clients/useUpdateClient.ts
import { useState } from "react";
import { Client } from "@/app/dashboard/masters/clients/page";
import { ClientsService } from "@/services/clients/clients.service";
import { ApiError } from "@/types";

interface UseUpdateClientProps {
  onSuccess?: (client: Client) => void;
  onError?: (error: ApiError) => void;
  onUpdateLocalState?: (client: Client) => void;
}

const useUpdateClient = ({
  onSuccess,
  onError,
  onUpdateLocalState,
}: UseUpdateClientProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Client | null>(null);

  // hooks/clients/useUpdateClient.ts - MEJORADO
  const updateClient = async (id: string, clientData: Partial<Client>) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📤 Enviando actualización:", { id, clientData });

      const response = await ClientsService.updateClient(id, clientData);

      console.log("📥 Respuesta del backend:", {
        data: response.data,
        salespersonUserIdActualizado: response.data.data?.salespersonUserId,
      });

      if (response.status === 200) {
        const updatedClient = response.data.data;

        const mappedClient: Client = {
          ...updatedClient,

          salesperson: updatedClient.salespersonUserId
            ? {
                id: updatedClient.salespersonUserId,
                first_name: "",
                last_name: "",
              }
            : undefined,
          salespersonUserId: updatedClient.salespersonUserId,
        };

        console.log("✅ Cliente actualizado exitosamente:", mappedClient);

        setData(mappedClient);

        // ✅ ACTUALIZAR INMEDIATAMENTE el estado local
        if (onUpdateLocalState) {
          onUpdateLocalState(mappedClient);
        }

        if (onSuccess) {
          onSuccess(mappedClient);
        }

        return mappedClient;
      } else {
        throw new Error("Error al actualizar el cliente");
      }
    } catch (err: any) {
      console.error("❌ Update error:", err);
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

      if (onError) {
        onError(apiError);
      }

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
