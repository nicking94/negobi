// hooks/paymentTerms/useDeletePaymentTerms.ts
import { useState, useCallback } from "react";
import { paymentTermsService } from "@/services/paymentTerms/paymentTerms.service";
import { PaymentTermDeleteResponse } from "@/types";

interface UseDeletePaymentTermsProps {
  onSuccess?: (data: PaymentTermDeleteResponse) => void;
  onError?: (error: Error) => void;
}

interface UseDeletePaymentTermsReturn {
  deletePaymentTerm: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: PaymentTermDeleteResponse | null;
  reset: () => void;
}

export const useDeletePaymentTerms = ({
  onSuccess,
  onError,
}: UseDeletePaymentTermsProps = {}): UseDeletePaymentTermsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentTermDeleteResponse | null>(null);

  const deletePaymentTerm = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await paymentTermsService.deletePaymentTerm(id);

        setData(response);
        onSuccess?.(response);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al eliminar el término de pago";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    deletePaymentTerm,
    loading,
    error,
    data,
    reset,
  };
};
