// hooks/paymentTerms/useGetPaymentTerms.ts
import { paymentTermsService } from "@/services/paymentTerms/paymentTerms.service";
import { useEffect, useState, useCallback } from "react";
import { GetPaymentTermsParams, PaymentTermType } from "@/types";

const useGetPaymentTerms = () => {
  const [loading, setLoading] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermType[]>([]);
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const getPaymentTerms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetPaymentTermsParams = {
        search: search.trim(),
        page,
        itemsPerPage,
        order: "ASC",
      };

      if (statusFilter !== "all") {
        params.is_active = statusFilter === "active";
      }

      const response = await paymentTermsService.getPaymentTerms(params);

      if (!response.success) {
        throw new Error("Error en la respuesta del servidor");
      }

      let paymentTermsData: PaymentTermType[] = [];
      let totalCount = 0;
      let totalPages = 0;

      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        "totalPages" in response.data &&
        "total" in response.data
      ) {
        const paginatedData = response.data as {
          data: PaymentTermType[];
          totalPages: number;
          total: number;
        };
        paymentTermsData = Array.isArray(paginatedData.data)
          ? paginatedData.data
          : [];
        totalPages = Number(paginatedData.totalPages) || 0;
        totalCount = Number(paginatedData.total) || 0;
      } else if (Array.isArray(response.data)) {
        paymentTermsData = response.data;
        totalCount = paymentTermsData.length;
        totalPages = Math.ceil(totalCount / itemsPerPage);
      } else {
        console.warn("⚠️ Estructura de respuesta inesperada:", response);
        setPaymentTerms([]);
        setTotalPage(0);
        setTotal(0);
        return;
      }

      const transformedPaymentTerms: PaymentTermType[] = paymentTermsData
        .filter(
          (paymentTerm): paymentTerm is PaymentTermType =>
            paymentTerm &&
            typeof paymentTerm === "object" &&
            "id" in paymentTerm
        )
        .map((paymentTerm) => ({
          id: paymentTerm.id,
          term_name: paymentTerm.term_name || "",
          term_description: paymentTerm.term_description || "",
          number_of_days: paymentTerm.number_of_days || 0,
          is_active: Boolean(paymentTerm.is_active),
          external_code: paymentTerm.external_code,
          sync_with_erp: Boolean(paymentTerm.sync_with_erp),
          created_at: paymentTerm.created_at || new Date().toISOString(),
          updated_at: paymentTerm.updated_at || new Date().toISOString(),
          deleted_at: paymentTerm.deleted_at,
        }));

      setPaymentTerms(transformedPaymentTerms);
      setTotalPage(totalPages);
      setTotal(totalCount);
    } catch (e: unknown) {
      console.error("❌ [useGetPaymentTerms] Error fetching payment terms:", e);
      const errorMessage =
        e instanceof Error ? e.message : "Error al cargar los términos de pago";
      setError(errorMessage);
      setPaymentTerms([]);
      setTotalPage(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, itemsPerPage, statusFilter]);

  useEffect(() => {
    getPaymentTerms();
  }, [modified, search, page, itemsPerPage, statusFilter, getPaymentTerms]);

  const refetch = useCallback(() => {
    setModified((prev) => !prev);
  }, []);

  return {
    loading,
    paymentTerms,
    modified,
    totalPage,
    total,
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    error,
    refetch,
  };
};

export default useGetPaymentTerms;
