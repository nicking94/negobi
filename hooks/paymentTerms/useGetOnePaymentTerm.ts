import { useState, useEffect } from "react";
import { paymentTermsService } from "@/services/paymentTerms/paymentTerms.service";
import { PaymentTermResponse } from "@/types";

export const useGetOnePaymentTerm = (id: string | undefined) => {
  const [data, setData] = useState<PaymentTermResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPaymentTerm = async () => {
      if (!id) {
        setData(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await paymentTermsService.getOnePaymentTerm(id);
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentTerm();
  }, [id]);

  return {
    data,
    loading,
    error,
  };
};
