// hooks/clients/useGetClients.ts
import { useEffect, useState, useCallback } from "react";
import { ClientsService } from "@/services/clients/clients.service";
import { Client } from "@/app/dashboard/masters/clients/page";
import { useUserCompany } from "@/hooks/auth/useUserCompany";

interface UseGetClientsParams {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  salespersonUserId?: string;
  companyId?: number;
  is_active?: boolean;
}

const useGetClients = (params: UseGetClientsParams = {}) => {
  const {
    companyId: userCompanyId,
    isLoading: companyLoading,
    isSuperAdmin,
  } = useUserCompany();
  const [loading, setLoading] = useState(false);
  const [clientsResponse, setClientsResponse] = useState<Client[]>([]);
  const [modified, setModified] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(
    params?.itemsPerPage || 1000
  );

  const effectiveCompanyId = params.companyId || userCompanyId;

  const getClients = useCallback(async () => {
    if (companyLoading) {
      return;
    }
    if (!effectiveCompanyId && !isSuperAdmin) {
      return;
    }

    try {
      setLoading(true);

      const queryParams: Record<string, any> = {
        search: params?.search || "",
        page,
        itemsPerPage,
        legal_name: params?.search || "",
      };

      if (effectiveCompanyId) {
        queryParams.companyId = effectiveCompanyId;
      }

      if (params?.salespersonUserId && params.salespersonUserId !== "all") {
        queryParams.salespersonUserId = params.salespersonUserId;
      }

      const { data } = await ClientsService.getClients(queryParams);

      let clientsData = [];
      if (data.data?.data && Array.isArray(data.data.data)) {
        clientsData = data.data.data;
      } else if (data.data && Array.isArray(data.data)) {
        clientsData = data.data;
      } else if (Array.isArray(data)) {
        clientsData = data;
      } else {
        console.warn("⚠️ Estructura de respuesta inesperada:", data);
        clientsData = [];
      }

      const mappedClients: Client[] = clientsData.map((client: any) => {
        let effectiveSalespersonUserId = undefined;

        if (client.salesperson && client.salesperson.id) {
          effectiveSalespersonUserId = Number(client.salesperson.id);
        }

        return {
          ...client,
          payment_term_id: client.payment_term_id || client.paymentTermId,
          salespersonUserId: effectiveSalespersonUserId,
          salesperson: client.salesperson || undefined,
          companyId: client.companyId || client.company?.id,
          company: client.company || undefined,
        };
      });

      setClientsResponse(mappedClients);
      setTotalPage(data.data?.totalPages || 0);
      setTotal(data.data?.total || 0);
    } catch (e) {
      console.error("❌ Error fetching clients:", e);
      return e;
    } finally {
      setLoading(false);
    }
  }, [
    effectiveCompanyId,
    companyLoading,
    isSuperAdmin,
    params?.search,
    page,
    itemsPerPage,
    params?.salespersonUserId,
    modified,
  ]);

  useEffect(() => {
    getClients();
  }, [getClients, modified, page, itemsPerPage]);

  const triggerRefresh = () => {
    setModified((prev: number) => prev + 1);
  };

  const updateClientInState = useCallback((updatedClient: Client) => {
    setClientsResponse((prev) =>
      prev.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  }, []);

  return {
    setModified: triggerRefresh,
    loading: loading || companyLoading,
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
    companyId: effectiveCompanyId,
    isSuperAdmin,
  };
};

export default useGetClients;
