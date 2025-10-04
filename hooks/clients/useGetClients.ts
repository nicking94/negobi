import { ClientsService } from "@/services/clients/clients.service";
import { useEffect, useState, useCallback } from "react";

interface UseGetClientsParams {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  salespersonUserId?: string;
  companyId?: number;
}

const useGetClients = (params: UseGetClientsParams = {}) => {
  const [loading, setLoading] = useState(false);
  const [clientsResponse, setClientsResponse] = useState([]);
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(params.page || 1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(params.itemsPerPage || 10);

  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = {
        search: params.search || "",
        page,
        itemsPerPage,
        // Solo incluir parámetros que la API realmente acepta
        legal_name: params.search || "", // Si quieres buscar por nombre legal
      };

      console.log("Fetching clients with params:", queryParams);

      const { data } = await ClientsService.getClients(queryParams);
      setClientsResponse(data.data.data);
      setTotalPage(data.data.totalPages);
      setTotal(data.data.total);
    } catch (e) {
      console.error("Error fetching clients:", e);
      return e;
    } finally {
      setLoading(false);
    }
  }, [params.search, page, itemsPerPage]);

  useEffect(() => {
    getClients();
  }, [getClients, modified]); // Agrega modified como dependencia

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
