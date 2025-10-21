// hooks/clients/useGetClients.ts
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
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(params.page || 1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(params.itemsPerPage || 10);

  // hooks/clients/useGetClients.ts
  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 useGetClients - Obteniendo clientes...");

      const queryParams: Record<string, any> = {
        search: params.search || "",
        page,
        itemsPerPage,
        legal_name: params.search || "",
      };

      if (params.salespersonUserId && params.salespersonUserId !== "all") {
        queryParams.salespersonUserId = params.salespersonUserId;
      }

      const { data } = await ClientsService.getClients(queryParams);

      console.log("📥 useGetClients - Datos recibidos:", {
        total: data.data.total,
        clientes: data.data.data.length,
        primerCliente: data.data.data[0]
          ? {
              id: data.data.data[0].id,
              legal_name: data.data.data[0].legal_name,
              salespersonUserId: data.data.data[0].salespersonUserId,
            }
          : "No hay clientes",
      });

      const mappedClients: Client[] = data.data.data.map((client: any) => {
        console.log(`🔍 Cliente ${client.id} - Datos completos:`, {
          salespersonUserId: client.salespersonUserId,

          erp_cod_seller: client.erp_cod_seller,
        });

        const effectiveSalespersonUserId =
          client.salespersonUserId !== undefined
            ? Number(client.salespersonUserId)
            : undefined;

        return {
          ...client,
          payment_term_id: client.payment_term_id || client.paymentTermId,

          salespersonUserId: effectiveSalespersonUserId,
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
    params.search,
    page,
    itemsPerPage,
    params.salespersonUserId,
    params.companyId,
  ]);

  useEffect(() => {
    console.log("🎯 useGetClients useEffect ejecutado", {
      modified,
      search: params.search,
      page,
      itemsPerPage,
      salespersonUserId: params.salespersonUserId,
    });
    getClients();
  }, [getClients, modified, page, itemsPerPage]);

  return {
    setModified,
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
  };
};

export default useGetClients;
