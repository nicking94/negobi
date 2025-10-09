// hooks/useClientTypes.ts
import { useState, useEffect } from "react";
import { ClientsService } from "@/services/clients/clients.service";
import { ClientType, ApiError } from "@/types";

interface UseClientTypesReturn {
  clientTypes: ClientType[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// hooks/useClientTypes.ts
// hooks/useClientTypes.ts
export const useClientTypes = (): UseClientTypesReturn => {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ClientsService.getClientTypes();
      console.log("📋 Raw client types response:", response);

      let types: ClientType[] = [];

      // Manejar diferentes estructuras de respuesta
      if (response.success && Array.isArray(response.data)) {
        // Si response.data es un array de strings, convertirlos a objetos ClientType
        types = response.data.map((type, index) => {
          if (typeof type === "string") {
            return {
              id: index + 1, // ID temporal basado en índice
              name: type,
              description: "", // Descripción vacía por defecto
              is_active: true,
            };
          }
          // Si ya es un objeto, mantenerlo como está
          return type;
        });
      }

      console.log("📋 Processed client types:", types);
      setClientTypes(types);
    } catch (err) {
      console.error("❌ Error fetching client types:", err);
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          "Error al obtener los tipos de cliente"
      );
      setClientTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientTypes();
  }, []);

  const refetch = () => {
    fetchClientTypes();
  };

  return { clientTypes, loading, error, refetch };
};
