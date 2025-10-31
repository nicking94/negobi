// hooks/paymentTerms/useGetPaymentTermsForSelect.ts
import { useState, useEffect } from "react";
import { paymentTermsService } from "@/services/paymentTerms/paymentTerms.service";
import { PaymentTermType } from "@/types";

const useGetPaymentTermsForSelect = () => {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentTerms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentTermsService.getPaymentTerms({
        page: 1,
        itemsPerPage: 100,
        order: "ASC",
        is_active: true,
      });

      if (response.success && response.data) {
        let termsData: PaymentTermType[] = [];

        if (Array.isArray(response.data)) {
          termsData = response.data;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          termsData = (response.data as any).data || [];
        }

        setPaymentTerms(termsData);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar términos de pago";
      setError(errorMessage);
      console.error("Error fetching payment terms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentTerms();
  }, []);

  return {
    paymentTerms,
    loading,
    error,
    refetch: fetchPaymentTerms,
  };
};

export default useGetPaymentTermsForSelect;
