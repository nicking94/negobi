// hooks/documents/useReturns.ts
import { useState, useEffect } from "react";
import {
  documentService,
  Document,
  GetDocumentsParams,
  DocumentStatus,
} from "@/services/documents/documents.service";

export interface UseReturnsFilters {
  companyId: number;
  search?: string;
  status?: DocumentStatus;
  startDate?: string;
  endDate?: string;
  clientId?: number;
}

export const useReturns = (filters: UseReturnsFilters) => {
  const [returns, setReturns] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReturns = async (customFilters?: Partial<UseReturnsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      const currentCompanyId = customFilters?.companyId || filters.companyId;

      if (!currentCompanyId || currentCompanyId === 0) {
        console.log("⚠️ companyId no válido, omitiendo carga de devoluciones");
        setReturns([]);
        return;
      }

      const baseFilters: Omit<GetDocumentsParams, "companyId"> = {
        document_type: "sales_return",
        page: 1,
        itemsPerPage: 100,
      };

      const apiFilters: GetDocumentsParams = {
        ...baseFilters,
        companyId: currentCompanyId,

        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.clientId && { clientId: filters.clientId }),
        ...customFilters,
      };

      if (customFilters?.companyId) {
        delete (apiFilters as any).companyId;
        apiFilters.companyId = currentCompanyId;
      }

      console.log("📋 Cargando devoluciones con filtros:", apiFilters);

      const returnsData = await documentService.getDocuments(apiFilters);

      console.log("📄 Devoluciones recibidas:", returnsData);
      console.log(`🔢 ${returnsData.length} devoluciones encontradas`);

      if (Array.isArray(returnsData)) {
        setReturns(returnsData);
      } else {
        console.warn("⚠️ returnsData no es array:", returnsData);
        setReturns([]);
      }
    } catch (err) {
      console.error("❌ Error al cargar devoluciones:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar devoluciones"
      );
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.companyId) {
      loadReturns();
    }
  }, [filters.companyId, filters.status, filters.startDate, filters.endDate]);

  return {
    returns,
    loading,
    error,
    refetch: loadReturns,
  };
};
