// hooks/suppliers/useGetSuppliers.ts
import { useEffect, useState, useCallback } from "react";
import { supplierService } from "@/services/suppliers/suppliers.service";
import { SupplierType, SupplierQueryType, ApiError } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface UseGetSuppliersReturn {
  loading: boolean;
  suppliersResponse: SupplierType[];
  modified: boolean;
  setModified: (modified: boolean | ((prev: boolean) => boolean)) => void;
  page: number;
  totalPage: number;
  total: number;
  itemsPerPage: number;
  search: string;
  companyId: number | undefined;
  error: string | null;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSearch: (search: string) => void;
  setCompanyId: (companyId: number | undefined) => void;
  refetch: () => void;
}

const useGetSuppliers = (): UseGetSuppliersReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliersResponse, setSuppliersResponse] = useState<SupplierType[]>(
    []
  );
  const [modified, setModified] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const getSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userCompanyId = user?.company_id;

      const params: SupplierQueryType = {
        search: search.trim(),
        page,
        itemsPerPage,
        companyId: companyId || userCompanyId,
      };

      const response = await supplierService.getSuppliers(params);

      if (response.success && response.data) {
        setSuppliersResponse(response.data.data || []);
        setTotalPage(response.data.totalPages || 0);
        setTotal(response.data.total || 0);
      } else {
        console.warn("⚠️ Respuesta inesperada:", response);
        setSuppliersResponse([]);
        setTotalPage(0);
        setTotal(0);
      }
    } catch (err: unknown) {
      console.error("❌ [useGetSuppliers] Error fetching suppliers:", err);

      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Error al cargar los proveedores";

      setError(errorMessage);
      setSuppliersResponse([]);
      setTotalPage(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, itemsPerPage, companyId, user?.company_id]);

  useEffect(() => {
    getSuppliers();
  }, [modified, search, page, itemsPerPage, companyId, getSuppliers]);

  const refetch = useCallback(() => {
    setModified((prev) => !prev);
  }, []);

  return {
    loading,
    suppliersResponse,
    modified,
    setModified,
    totalPage,
    total,
    page,
    itemsPerPage,
    search,
    companyId,
    error,
    setPage,
    setItemsPerPage,
    setSearch,
    setCompanyId,
    refetch,
  };
};

export default useGetSuppliers;
