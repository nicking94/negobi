import { useState, useEffect } from "react";
import {
  paymentMethodService,
  PaymentMethod,
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  GetPaymentMethodsParams,
} from "../../services/paymentMethods/paymentMethods.service";

export interface UsePaymentMethodsFilters {
  search?: string;
  method_name?: string;
  description?: string;
  is_active?: boolean;
}

export const usePaymentMethods = (filters: UsePaymentMethodsFilters = {}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentMethods = async (
    customFilters?: Partial<UsePaymentMethodsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetPaymentMethodsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const paymentMethodsData = await paymentMethodService.getPaymentMethods(
        combinedFilters
      );

      if (Array.isArray(paymentMethodsData)) {
        setPaymentMethods(paymentMethodsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", paymentMethodsData);
        setPaymentMethods([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar métodos de pago"
      );
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentMethod = async (
    paymentMethodData: CreatePaymentMethodData
  ): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      const newPaymentMethod = await paymentMethodService.createPaymentMethod(
        paymentMethodData
      );
      setPaymentMethods((prev) => [...prev, newPaymentMethod]);
      return newPaymentMethod;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear método de pago"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (
    id: string,
    updates: UpdatePaymentMethodData
  ): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedPaymentMethod =
        await paymentMethodService.updatePaymentMethod(id, updates);
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.id.toString() === id ? updatedPaymentMethod : method
        )
      );
      return updatedPaymentMethod;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar método de pago"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await paymentMethodService.deletePaymentMethod(id);
      setPaymentMethods((prev) =>
        prev.filter((method) => method.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar método de pago"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodById = async (
    id: string
  ): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      const paymentMethod = await paymentMethodService.getPaymentMethodById(id);
      return paymentMethod;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener método de pago"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodByName = async (
    name: string
  ): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      const paymentMethod = await paymentMethodService.getPaymentMethodByName(
        name
      );
      return paymentMethod;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener método de pago por nombre"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const initializeCommonPaymentMethods = async (): Promise<
    PaymentMethod[] | null
  > => {
    try {
      setLoading(true);
      setError(null);
      const commonMethods =
        await paymentMethodService.getCommonPaymentMethods();

      await loadPaymentMethods();
      return commonMethods;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al inicializar métodos de pago comunes"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [
    filters.search,
    filters.method_name,
    filters.description,
    filters.is_active,
  ]);

  return {
    paymentMethods,
    loading,
    error,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethodById,
    getPaymentMethodByName,
    initializeCommonPaymentMethods,
    refetch: loadPaymentMethods,
  };
};

export const useActivePaymentMethods = () => {
  const [activePaymentMethods, setActivePaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivePaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const paymentMethods =
        await paymentMethodService.getActivePaymentMethods();
      setActivePaymentMethods(paymentMethods);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar métodos de pago activos"
      );
      setActivePaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivePaymentMethods();
  }, []);

  return {
    activePaymentMethods,
    loading,
    error,
    refetch: loadActivePaymentMethods,
  };
};

export const usePaymentMethodOptions = () => {
  const { activePaymentMethods, loading, error, refetch } =
    useActivePaymentMethods();

  const paymentMethodOptions = activePaymentMethods.map((method) => ({
    value: method.id,
    label: method.method_name,
    description: method.description,
    is_active: method.is_active,
  }));

  const commonPaymentMethodOptions = [
    { value: "cash", label: "Efectivo", description: "Pago en efectivo" },
    {
      value: "credit_card",
      label: "Tarjeta de Crédito",
      description: "Pago con tarjeta de crédito",
    },
    {
      value: "debit_card",
      label: "Tarjeta de Débito",
      description: "Pago con tarjeta de débito",
    },
    {
      value: "transfer",
      label: "Transferencia Bancaria",
      description: "Transferencia bancaria",
    },
    { value: "check", label: "Cheque", description: "Pago con cheque" },
    { value: "deposit", label: "Depósito", description: "Depósito bancario" },
  ];

  return {
    paymentMethodOptions,
    commonPaymentMethodOptions,
    paymentMethods: activePaymentMethods,
    loading,
    error,
    refetch,
  };
};

export const usePaymentMethodManager = () => {
  const {
    paymentMethods,
    loading,
    error,
    refetch,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = usePaymentMethods();

  const createQuickPaymentMethod = async (
    methodName: string,
    description?: string
  ) => {
    const paymentMethodData: CreatePaymentMethodData = {
      method_name: methodName,
      description: description || `Método de pago: ${methodName}`,
      is_active: true,
    };

    return await createPaymentMethod(paymentMethodData);
  };

  const togglePaymentMethodStatus = async (
    id: string,
    isActive: boolean
  ): Promise<boolean> => {
    try {
      await updatePaymentMethod(id, { is_active: isActive });
      return true;
    } catch (error) {
      console.error("Error toggling payment method status:", error);
      return false;
    }
  };

  const searchPaymentMethods = (searchTerm: string): PaymentMethod[] => {
    if (!searchTerm) return paymentMethods;

    const term = searchTerm.toLowerCase();
    return paymentMethods.filter(
      (method) =>
        method.method_name.toLowerCase().includes(term) ||
        method.description?.toLowerCase().includes(term)
    );
  };

  const getPaymentMethodByIdSync = (id: number): PaymentMethod | undefined => {
    return paymentMethods.find((method) => method.id === id);
  };

  return {
    paymentMethods,
    loading,
    error,
    createQuickPaymentMethod,
    togglePaymentMethodStatus,
    searchPaymentMethods,
    getPaymentMethodByIdSync,
    refetch,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};

export const usePaymentMethodStats = () => {
  const { paymentMethods, loading, error, refetch } = usePaymentMethods();

  const stats = {
    total: paymentMethods.length,
    active: paymentMethods.filter((method) => method.is_active).length,
    inactive: paymentMethods.filter((method) => !method.is_active).length,
    recentlyCreated: paymentMethods.filter((method) => {
      const createdDate = new Date(method.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length,
  };

  return {
    stats,
    paymentMethods,
    loading,
    error,
    refetch,
  };
};
