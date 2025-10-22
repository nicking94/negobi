// hooks/clients/useGetClients.ts - SIN REACT QUERY
import { useEffect, useState, useCallback } from "react";
import { ClientsService } from "@/services/clients/clients.service";
import { Client } from "@/app/dashboard/masters/clients/page";

interface UseGetClientsParams {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  salespersonUserId?: string;
  companyId?: number;
}

const useGetClients = (params: UseGetClientsParams = {}) => {
  const [loading, setLoading] = useState(false);
  const [clientsResponse, setClientsResponse] = useState<Client[]>([]);
  const [modified, setModified] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(params?.itemsPerPage || 10);

  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 useGetClients - Obteniendo clientes...", { modified });

      const queryParams: Record<string, any> = {
        search: params?.search || "",
        page,
        itemsPerPage,
        legal_name: params?.search || "",
      };

      if (params?.salespersonUserId && params.salespersonUserId !== "all") {
        queryParams.salespersonUserId = params.salespersonUserId;
      }

      const { data } = await ClientsService.getClients(queryParams);

      console.log("📥 useGetClients - Datos recibidos DEL BACKEND:", {
        total: data.data.total,
        clientes: data.data.data.length,
        primerClienteCompleto: data.data.data[0]
          ? {
              id: data.data.data[0].id,
              legal_name: data.data.data[0].legal_name,
              salespersonUserId: data.data.data[0].salespersonUserId,
              salesperson_user_id: data.data.data[0].salesperson_user_id,
              salesperson: data.data.data[0].salesperson,
            }
          : "No hay clientes",
      });

      // hooks/clients/useGetClients.ts - CORREGIDO DEFINITIVAMENTE
      const mappedClients: Client[] = data.data.data.map((client: any) => {
        console.log(`🔍 Cliente ${client.id} - Datos CRUDOS del backend:`, {
          salesperson: client.salesperson,
          salespersonUserId: client.salespersonUserId,
        });

        // ✅ ESTRATEGIA DEFINITIVA: Siempre usar el ID del objeto salesperson
        // El backend es inconsistente con salespersonUserId, pero el objeto salesperson es confiable
        let effectiveSalespersonUserId = undefined;

        if (client.salesperson && client.salesperson.id) {
          // ✅ PRIORIDAD 1: Usar siempre el ID del objeto salesperson
          effectiveSalespersonUserId = Number(client.salesperson.id);
          console.log(
            `✅ Cliente ${client.id} - ID de salesperson:`,
            effectiveSalespersonUserId
          );
        }
        // ❌ NO confiar en salespersonUserId del backend para consultas
        // porque viene undefined incluso cuando el cliente tiene vendedor

        return {
          ...client,
          payment_term_id: client.payment_term_id || client.paymentTermId,
          salespersonUserId: effectiveSalespersonUserId, // ← Este será el id de salesperson
          salesperson: client.salesperson || undefined,
        };
      });

      setClientsResponse(mappedClients);
      setTotalPage(data.data.totalPages);
      setTotal(data.data.total);
    } catch (e) {
      console.error("❌ Error fetching clients:", e);
      return e;
    } finally {
      setLoading(false);
    }
  }, [
    params?.search,
    page,
    itemsPerPage,
    params?.salespersonUserId,
    params?.companyId,
    modified,
  ]);

  useEffect(() => {
    console.log("🎯 useGetClients useEffect ejecutado", {
      modified,
      search: params?.search,
      page,
      itemsPerPage,
      salespersonUserId: params?.salespersonUserId,
    });
    getClients();
  }, [getClients, modified, page, itemsPerPage]);

  const triggerRefresh = () => {
    console.log("🔄 Forzando recarga de clientes...");
    setModified((prev: number) => prev + 1);
  };

  const updateClientInState = useCallback((updatedClient: Client) => {
    console.log("🔄 Actualizando cliente en estado local:", updatedClient);
    setClientsResponse((prev) =>
      prev.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  }, []);

  return {
    setModified: triggerRefresh,
    loading,
    clientsResponse,
    modified,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    page,
    itemsPerPage,
    refetch: getClients,
    updateClientInState,
  };
};

export default useGetClients;
