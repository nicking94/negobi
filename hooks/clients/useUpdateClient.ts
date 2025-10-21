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

  // hooks/clients/useUpdateClient.ts
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

        // ✅ Mapeo consistente con useGetClients
        const effectiveSalespersonUserId =
          updatedClient.salespersonUserId !== undefined
            ? Number(updatedClient.salespersonUserId)
            : undefined;

        const mappedClient: Client = {
          ...updatedClient,
          salespersonUserId: effectiveSalespersonUserId,
        };

        console.log("✅ Cliente actualizado exitosamente:", mappedClient);

        setData(mappedClient);
        onSuccess?.(mappedClient);
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
