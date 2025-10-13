import { useState, useEffect } from "react";
import {
  paymentService,
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentType,
  GetPaymentsParams,
} from "../../services/payments/payments.service";

// Definir el tipo para los filtros del hook
export interface UsePaymentsFilters {
  clientId?: number;
  supplierId?: number;
  payment_type?: PaymentType;
  invoice_id?: number;
  operation_type_id?: number;
  payment_date?: string;
  payment_amount?: number;
  paymentCurrencyId?: number;
  paymentMethodId?: number;
  bankAccountId?: number;
  reference_number?: string;
  search?: string;
}

export const usePayments = (filters: UsePaymentsFilters = {}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los pagos con filtros
  const loadPayments = async (customFilters?: Partial<UsePaymentsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetPaymentsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 1000,
      };

      console.log("🔵 Enviando parámetros para pagos:", combinedFilters);

      const paymentsData = await paymentService.getPayments(combinedFilters);
      console.log("🟢 Datos de pagos recibidos:", paymentsData);

      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", paymentsData);
        setPayments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pagos");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear pago
  const createPayment = async (
    paymentData: CreatePaymentData
  ): Promise<Payment | null> => {
    try {
      setLoading(true);
      setError(null);
      const newPayment = await paymentService.createPayment(paymentData);
      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear pago");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar pago
  const updatePayment = async (
    id: string,
    updates: UpdatePaymentData
  ): Promise<Payment | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedPayment = await paymentService.updatePayment(id, updates);
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id.toString() === id ? updatedPayment : payment
        )
      );
      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar pago");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar pago
  const deletePayment = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.deletePayment(id);
      setPayments((prev) =>
        prev.filter((payment) => payment.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar pago");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener pago por ID
  const getPaymentById = async (id: string): Promise<Payment | null> => {
    try {
      setLoading(true);
      setError(null);
      const payment = await paymentService.getPaymentById(id);
      return payment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener pago");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar pagos al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadPayments();
  }, [
    filters.clientId,
    filters.supplierId,
    filters.payment_type,
    filters.invoice_id,
    filters.operation_type_id,
    filters.payment_date,
    filters.payment_amount,
    filters.paymentCurrencyId,
    filters.paymentMethodId,
    filters.bankAccountId,
    filters.reference_number,
    filters.search,
  ]);

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    refetch: loadPayments,
  };
};

// Hook especializado para pagos de clientes
export const useClientPayments = (clientId?: number) => {
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientPayments = async (id?: number) => {
    const targetClientId = id || clientId;
    if (!targetClientId) {
      setError("clientId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payments = await paymentService.getClientPayments(targetClientId);
      setClientPayments(payments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar pagos del cliente"
      );
      setClientPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadClientPayments();
    }
  }, [clientId]);

  return {
    clientPayments,
    loading,
    error,
    refetch: loadClientPayments,
  };
};

// Hook especializado para pagos a proveedores
export const useSupplierPayments = (supplierId?: number) => {
  const [supplierPayments, setSupplierPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSupplierPayments = async (id?: number) => {
    const targetSupplierId = id || supplierId;
    if (!targetSupplierId) {
      setError("supplierId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payments = await paymentService.getSupplierPayments(
        targetSupplierId
      );
      setSupplierPayments(payments);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar pagos a proveedores"
      );
      setSupplierPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) {
      loadSupplierPayments();
    }
  }, [supplierId]);

  return {
    supplierPayments,
    loading,
    error,
    refetch: loadSupplierPayments,
  };
};

// Hook especializado para pagos por rango de fechas
export const usePaymentsByDateRange = (
  startDate?: string,
  endDate?: string,
  paymentType?: PaymentType
) => {
  const [dateRangePayments, setDateRangePayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentsByDateRange = async (
    start?: string,
    end?: string,
    type?: PaymentType
  ) => {
    const targetStartDate = start || startDate;
    const targetEndDate = end || endDate;
    const targetPaymentType = type || paymentType;

    if (!targetStartDate || !targetEndDate) {
      setError("startDate y endDate son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payments = await paymentService.getPaymentsByDateRange(
        targetStartDate,
        targetEndDate,
        targetPaymentType
      );
      setDateRangePayments(payments);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar pagos por rango de fechas"
      );
      setDateRangePayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      loadPaymentsByDateRange();
    }
  }, [startDate, endDate, paymentType]);

  return {
    dateRangePayments,
    loading,
    error,
    refetch: loadPaymentsByDateRange,
  };
};

// Hook para pagos por factura
export const usePaymentsByInvoice = (invoiceId?: number) => {
  const [invoicePayments, setInvoicePayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentsByInvoice = async (id?: number) => {
    const targetInvoiceId = id || invoiceId;
    if (!targetInvoiceId) {
      setError("invoiceId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payments = await paymentService.getPaymentsByInvoice(
        targetInvoiceId
      );
      setInvoicePayments(payments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar pagos por factura"
      );
      setInvoicePayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      loadPaymentsByInvoice();
    }
  }, [invoiceId]);

  return {
    invoicePayments,
    loading,
    error,
    refetch: loadPaymentsByInvoice,
  };
};

// Hook para estadísticas de pagos
export const usePaymentStats = (filters: UsePaymentsFilters = {}) => {
  const { payments, loading, error, refetch } = usePayments(filters);

  const stats = {
    totalAmount: payments.reduce(
      (sum, payment) => sum + payment.payment_amount,
      0
    ),
    totalPayments: payments.length,
    clientPayments: payments.filter((p) => p.payment_type === "client_payment")
      .length,
    supplierPayments: payments.filter(
      (p) => p.payment_type === "supplier_payment"
    ).length,
    averageAmount:
      payments.length > 0
        ? payments.reduce((sum, payment) => sum + payment.payment_amount, 0) /
          payments.length
        : 0,
  };

  return {
    stats,
    payments,
    loading,
    error,
    refetch,
  };
};
