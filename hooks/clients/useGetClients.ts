// hooks/clients/useGetClients.ts
import { useEffect, useState, useCallback } from "react";
import { ClientsService } from "@/services/clients/clients.service";
import { Client } from "@/app/dashboard/masters/clients/page"; // Importa el tipo Client

interface UseGetClientsParams {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  salespersonUserId?: string;
  companyId?: number;
}

const useGetClients = (params: UseGetClientsParams = {}) => {
  const [loading, setLoading] = useState(false);
  const [clientsResponse, setClientsResponse] = useState<Client[]>([]); // ✅ Especifica el tipo Client[]
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(params.page || 1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(params.itemsPerPage || 10);

  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams: Record<string, any> = {
        search: params.search || "",
        page,
        itemsPerPage,
        legal_name: params.search || "",
      };

      // ✅ Solo incluye salespersonUserId si tiene valor y no es "all"
      if (params.salespersonUserId && params.salespersonUserId !== "all") {
        queryParams.salespersonUserId = params.salespersonUserId;
      }

      if (params.companyId) {
        queryParams.companyId = params.companyId;
      }

      const { data } = await ClientsService.getClients(queryParams);

      const mappedClients: Client[] = data.data.data.map((client: any) => ({
        ...client,
        payment_term_id: client.payment_term_id || client.paymentTermId,
        // ✅ Asegúrate de mapear correctamente el vendedor
        salespersonUserId:
          client.salespersonUserId || client.salesperson_user_id,
      }));

      setClientsResponse(mappedClients);
      setTotalPage(data.data.totalPages);
      setTotal(data.data.total);
    } catch (e) {
      console.error("Error fetching clients:", e);
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
    getClients();
  }, [getClients, modified]);

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
  };
};

export default useGetClients;
