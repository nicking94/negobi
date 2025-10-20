import { useState, useEffect } from "react";
import {
  pendingAccountService,
  PendingAccount,
  CreatePendingAccountData,
  UpdatePendingAccountData,
  AccountType,
  AccountStatus,
  GetPendingAccountsParams,
} from "../../services/pendingAccounts/pendingAccounts.service";

// Definir el tipo para los filtros del hook
export interface UsePendingAccountsFilters {
  account_type?: AccountType;
  companyId?: number;
  clientId?: number;
  supplierId?: number;
  documentId?: number;
  amount_due?: number;
  balance_due?: number;
  currencyId?: number;
  due_date?: string;
  status?: string;
  search?: string;
}

export const usePendingAccounts = (filters: UsePendingAccountsFilters = {}) => {
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las cuentas pendientes con filtros
  const loadPendingAccounts = async (
    customFilters?: Partial<UsePendingAccountsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetPendingAccountsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const pendingAccountsData =
        await pendingAccountService.getPendingAccounts(combinedFilters);

      if (Array.isArray(pendingAccountsData)) {
        setPendingAccounts(pendingAccountsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", pendingAccountsData);
        setPendingAccounts([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas pendientes"
      );
      setPendingAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear cuenta pendiente
  const createPendingAccount = async (
    pendingAccountData: CreatePendingAccountData
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const newPendingAccount =
        await pendingAccountService.createPendingAccount(pendingAccountData);
      setPendingAccounts((prev) => [...prev, newPendingAccount]);
      return newPendingAccount;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear cuenta pendiente"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cuenta pendiente
  const updatePendingAccount = async (
    id: string,
    updates: UpdatePendingAccountData
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedPendingAccount =
        await pendingAccountService.updatePendingAccount(id, updates);
      setPendingAccounts((prev) =>
        prev.map((account) =>
          account.id.toString() === id ? updatedPendingAccount : account
        )
      );
      return updatedPendingAccount;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar cuenta pendiente"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cuenta pendiente
  const deletePendingAccount = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await pendingAccountService.deletePendingAccount(id);
      setPendingAccounts((prev) =>
        prev.filter((account) => account.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar cuenta pendiente"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener cuenta pendiente por ID
  const getPendingAccountById = async (
    id: string
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const pendingAccount = await pendingAccountService.getPendingAccountById(
        id
      );
      return pendingAccount;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener cuenta pendiente"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Aplicar pago a cuenta pendiente
  const applyPayment = async (
    accountId: string,
    paymentAmount: number
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedAccount = await pendingAccountService.applyPayment(
        accountId,
        paymentAmount
      );
      setPendingAccounts((prev) =>
        prev.map((account) =>
          account.id.toString() === accountId ? updatedAccount : account
        )
      );
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aplicar pago");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar cuentas pendientes al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadPendingAccounts();
  }, [
    filters.account_type,
    filters.companyId,
    filters.clientId,
    filters.supplierId,
    filters.documentId,
    filters.amount_due,
    filters.balance_due,
    filters.currencyId,
    filters.due_date,
    filters.status,
    filters.search,
  ]);

  return {
    pendingAccounts,
    loading,
    error,
    createPendingAccount,
    updatePendingAccount,
    deletePendingAccount,
    getPendingAccountById,
    applyPayment,
    refetch: loadPendingAccounts,
  };
};

// Hook especializado para cuentas por cobrar
export const useReceivableAccounts = (companyId?: number) => {
  const [receivableAccounts, setReceivableAccounts] = useState<
    PendingAccount[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReceivableAccounts = async (id?: number) => {
    const targetCompanyId = id || companyId;

    try {
      setLoading(true);
      setError(null);
      const accounts = await pendingAccountService.getReceivableAccounts(
        targetCompanyId
      );
      setReceivableAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas por cobrar"
      );
      setReceivableAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceivableAccounts();
  }, [companyId]);

  return {
    receivableAccounts,
    loading,
    error,
    refetch: loadReceivableAccounts,
  };
};

// Hook especializado para cuentas por pagar
export const usePayableAccounts = (companyId?: number) => {
  const [payableAccounts, setPayableAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayableAccounts = async (id?: number) => {
    const targetCompanyId = id || companyId;

    try {
      setLoading(true);
      setError(null);
      const accounts = await pendingAccountService.getPayableAccounts(
        targetCompanyId
      );
      setPayableAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cuentas por pagar"
      );
      setPayableAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayableAccounts();
  }, [companyId]);

  return {
    payableAccounts,
    loading,
    error,
    refetch: loadPayableAccounts,
  };
};

// Hook especializado para cuentas vencidas
export const useOverdueAccounts = (companyId?: number) => {
  const [overdueAccounts, setOverdueAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverdueAccounts = async (id?: number) => {
    const targetCompanyId = id || companyId;

    try {
      setLoading(true);
      setError(null);
      const accounts = await pendingAccountService.getOverdueAccounts(
        targetCompanyId
      );
      setOverdueAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cuentas vencidas"
      );
      setOverdueAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverdueAccounts();
  }, [companyId]);

  return {
    overdueAccounts,
    loading,
    error,
    refetch: loadOverdueAccounts,
  };
};

// Hook especializado para cuentas de un cliente
export const useClientPendingAccounts = (clientId?: number) => {
  const [clientAccounts, setClientAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientAccounts = async (id?: number) => {
    const targetClientId = id || clientId;
    if (!targetClientId) {
      setError("clientId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const accounts = await pendingAccountService.getAccountsByClient(
        targetClientId
      );
      setClientAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas del cliente"
      );
      setClientAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadClientAccounts();
    }
  }, [clientId]);

  return {
    clientAccounts,
    loading,
    error,
    refetch: loadClientAccounts,
  };
};

// Hook especializado para cuentas de un proveedor
export const useSupplierPendingAccounts = (supplierId?: number) => {
  const [supplierAccounts, setSupplierAccounts] = useState<PendingAccount[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSupplierAccounts = async (id?: number) => {
    const targetSupplierId = id || supplierId;
    if (!targetSupplierId) {
      setError("supplierId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const accounts = await pendingAccountService.getAccountsBySupplier(
        targetSupplierId
      );
      setSupplierAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas del proveedor"
      );
      setSupplierAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) {
      loadSupplierAccounts();
    }
  }, [supplierId]);

  return {
    supplierAccounts,
    loading,
    error,
    refetch: loadSupplierAccounts,
  };
};

// Hook para totales y estadísticas
export const usePendingAccountsTotals = (companyId?: number) => {
  const [totals, setTotals] = useState<{
    totalReceivable: number;
    totalPayable: number;
    totalOverdue: number;
    totalOutstanding: number;
  }>({
    totalReceivable: 0,
    totalPayable: 0,
    totalOverdue: 0,
    totalOutstanding: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTotals = async (id?: number) => {
    const targetCompanyId = id || companyId;

    try {
      setLoading(true);
      setError(null);
      const totalsData = await pendingAccountService.calculateTotals(
        targetCompanyId
      );
      setTotals(totalsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar totales de cuentas"
      );
      setTotals({
        totalReceivable: 0,
        totalPayable: 0,
        totalOverdue: 0,
        totalOutstanding: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotals();
  }, [companyId]);

  return {
    totals,
    loading,
    error,
    refetch: loadTotals,
  };
};

// Hook para gestión de vencimientos
export const useDueDateManager = (
  companyId?: number,
  daysRange: number = 30
) => {
  const [upcomingAccounts, setUpcomingAccounts] = useState<PendingAccount[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUpcomingAccounts = async (id?: number, range?: number) => {
    const targetCompanyId = id || companyId;
    const targetRange = range || daysRange;

    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + targetRange);

      const startDateStr = today.toISOString().split("T")[0];
      const endDateStr = futureDate.toISOString().split("T")[0];

      const accounts = await pendingAccountService.getAccountsByDueDateRange(
        startDateStr,
        endDateStr,
        targetCompanyId
      );

      setUpcomingAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas próximas a vencer"
      );
      setUpcomingAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadUpcomingAccounts();
    }
  }, [companyId, daysRange]);

  return {
    upcomingAccounts,
    loading,
    error,
    refetch: loadUpcomingAccounts,
  };
};

// Hook para dashboard financiero
export const useFinancialDashboard = (companyId?: number) => {
  const {
    totals,
    loading: totalsLoading,
    error: totalsError,
  } = usePendingAccountsTotals(companyId);
  const {
    overdueAccounts,
    loading: overdueLoading,
    error: overdueError,
  } = useOverdueAccounts(companyId);
  const {
    upcomingAccounts,
    loading: upcomingLoading,
    error: upcomingError,
  } = useDueDateManager(companyId, 7);

  const loading = totalsLoading || overdueLoading || upcomingLoading;
  const error = totalsError || overdueError || upcomingError;

  const dashboardData = {
    totals,
    overdueCount: overdueAccounts.length,
    overdueAmount: overdueAccounts.reduce(
      (sum, account) => sum + account.balance_due,
      0
    ),
    upcomingCount: upcomingAccounts.length,
    upcomingAmount: upcomingAccounts.reduce(
      (sum, account) => sum + account.balance_due,
      0
    ),
    criticalAccounts: overdueAccounts.slice(0, 5), // Top 5 cuentas más críticas
    upcomingDueAccounts: upcomingAccounts.slice(0, 5), // Próximas 5 cuentas a vencer
  };

  return {
    dashboardData,
    loading,
    error,
    overdueAccounts,
    upcomingAccounts,
  };
};
