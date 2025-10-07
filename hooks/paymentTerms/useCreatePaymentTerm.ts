// hooks/paymentTerms/useCreatePaymentTerm.ts
import { useState, useCallback } from "react";
import { paymentTermsService } from "@/services/paymentTerms/paymentTerms.service";
import { PaymentTermResponse, PaymentTermCreatePayload } from "@/types";

interface UseCreatePaymentTermProps {
  onSuccess?: (data: PaymentTermResponse) => void;
  onError?: (error: Error) => void;
  refetch?: () => void;
}

interface UseCreatePaymentTermReturn {
  createPaymentTerm: (data: PaymentTermCreatePayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: PaymentTermResponse | null;
  reset: () => void;
}

export const useCreatePaymentTerm = ({
  onSuccess,
  onError,
  refetch,
}: UseCreatePaymentTermProps = {}): UseCreatePaymentTermReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentTermResponse | null>(null);

  const createPaymentTerm = useCallback(
    async (payload: PaymentTermCreatePayload) => {
      try {
        setLoading(true);
        setError(null);

        const response = await paymentTermsService.createPaymentTerm(payload);

        setData(response);
        onSuccess?.(response);
        refetch?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al crear el término de pago";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, refetch]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    createPaymentTerm,
    loading,
    error,
    data,
    reset,
  };
};
