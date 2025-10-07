// hooks/paymentTerms/usePatchPaymentTerms.ts
import { useState, useCallback } from "react";
import { paymentTermsService } from "@/services/paymentTerms/paymentTerms.service";
import { PaymentTermResponse, PaymentTermUpdatePayload } from "@/types";

interface UsePatchPaymentTermsProps {
  onSuccess?: (data: PaymentTermResponse) => void;
  onError?: (error: Error) => void;
  refetch?: () => void; // ← Agregar esta prop
}

interface UsePatchPaymentTermsReturn {
  updatePaymentTerm: (params: {
    id: string;
    data: PaymentTermUpdatePayload;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  data: PaymentTermResponse | null;
  reset: () => void;
}

export const usePatchPaymentTerms = ({
  onSuccess,
  onError,
  refetch, // ← Recibir la prop
}: UsePatchPaymentTermsProps = {}): UsePatchPaymentTermsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentTermResponse | null>(null);

  const updatePaymentTerm = useCallback(
    async ({
      id,
      data: updateData,
    }: {
      id: string;
      data: PaymentTermUpdatePayload;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await paymentTermsService.updatePaymentTerm(
          id,
          updateData
        );

        setData(response);
        onSuccess?.(response);
        refetch?.(); // ← Llamar refetch después del éxito
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al actualizar el término de pago";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, refetch] // ← Agregar refetch a las dependencias
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    updatePaymentTerm,
    loading,
    error,
    data,
    reset,
  };
};
