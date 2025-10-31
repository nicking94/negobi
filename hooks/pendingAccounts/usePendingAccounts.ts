import { useState, useEffect } from "react";
import {
  pendingAccountsService,
  PendingAccount,
  CreatePendingAccountData,
  UpdatePendingAccountData,
  AccountType,
  GetPendingAccountsParams,
  pendingAccountService,
} from "../../services/pendingAccounts/pendingAccounts.service";
import useUserCompany from "../auth/useUserCompany";

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
  const { companyId, selectedCompanyId } = useUserCompany();
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadPendingAccounts = async (
    customFilters?: Partial<UsePendingAccountsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const targetCompanyId = selectedCompanyId || companyId;

      if (!targetCompanyId || isNaN(Number(targetCompanyId))) {
        console.warn("⚠️ companyId no válido, no se hará la petición");
        setPendingAccounts([]);
        return;
      }

      const combinedFilters: GetPendingAccountsParams = {
        ...filters,
        ...customFilters,
        companyId: Number(targetCompanyId),
        page: 1,
        itemsPerPage: 100,
      };

      const pendingAccountsData = await pendingAccountsService.getAll(
        combinedFilters
      );

      if (Array.isArray(pendingAccountsData)) {
        const normalizedAccounts = pendingAccountsData.map((account) => ({
          ...account,

          companyId: account.companyId || (account as any).company?.id,
          clientId: account.clientId || (account as any).client?.id,
          supplierId: account.supplierId || (account as any).supplier?.id,
          currencyId: account.currencyId || (account as any).currency?.id,

          amount_due:
            typeof account.amount_due === "string"
              ? parseFloat(account.amount_due)
              : account.amount_due,
          balance_due:
            typeof account.balance_due === "string"
              ? parseFloat(account.balance_due)
              : account.balance_due,
        }));

        setPendingAccounts(normalizedAccounts);
      } else {
        console.warn("⚠️ Estructura inesperada:", pendingAccountsData);
        setPendingAccounts([]);
      }
    } catch (err: any) {
      console.error("❌ Error en loadPendingAccounts:", err);
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Error al cargar cuentas pendientes");
      setError(errorMessage);
      setPendingAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const createPendingAccount = async (
    pendingAccountData: CreatePendingAccountData
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const newPendingAccount = await pendingAccountsService.create(
        pendingAccountData
      );

      forceRefresh();

      return newPendingAccount;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Error al crear cuenta pendiente");
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePendingAccount = async (
    id: string,
    updates: UpdatePendingAccountData
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedPendingAccount = await pendingAccountsService.update(
        id,
        updates
      );

      forceRefresh();

      return updatedPendingAccount;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Error al actualizar cuenta pendiente");
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePendingAccount = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await pendingAccountsService.delete(id);
      forceRefresh();

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Error al eliminar cuenta pendiente");
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPendingAccountById = async (
    id: string
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const pendingAccount = await pendingAccountsService.getById(id);
      return pendingAccount;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Error al obtener cuenta pendiente");
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyPayment = async (
    accountId: string,
    paymentAmount: number
  ): Promise<PendingAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedAccount = await pendingAccountsService.applyPayment(
        accountId,
        paymentAmount
      );

      forceRefresh();

      return updatedAccount;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error ? err.message : "Error al aplicar pago");
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAccounts();
  }, [
    companyId,
    selectedCompanyId,
    filters.account_type,
    filters.clientId,
    filters.supplierId,
    filters.documentId,
    filters.amount_due,
    filters.balance_due,
    filters.currencyId,
    filters.due_date,
    filters.status,
    filters.search,
    refreshTrigger,
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
    forceRefresh,
  };
};

export const useReceivableAccounts = (companyId?: number) => {
  const [receivableAccounts, setReceivableAccounts] = useState<
    PendingAccount[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadReceivableAccounts = async (id?: number) => {
    const targetCompanyId = id || companyId;

    try {
      setLoading(true);
      setError(null);
      const accounts = await pendingAccountsService.getReceivableAccounts(
        targetCompanyId
      );
      setReceivableAccounts(accounts);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Error al cargar cuentas por cobrar");
      setError(errorMessage);
      setReceivableAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    loadReceivableAccounts();
  }, [companyId, refreshTrigger]);

  return {
    receivableAccounts,
    loading,
    error,
    refetch: loadReceivableAccounts,
    forceRefresh,
  };
};

export const usePayableAccounts = (companyId?: number) => {
  const [payableAccounts, setPayableAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    loadPayableAccounts();
  }, [companyId, refreshTrigger]);

  return {
    payableAccounts,
    loading,
    error,
    refetch: loadPayableAccounts,
    forceRefresh,
  };
};

export const useOverdueAccounts = (companyId?: number) => {
  const [overdueAccounts, setOverdueAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    loadOverdueAccounts();
  }, [companyId, refreshTrigger]);

  return {
    overdueAccounts,
    loading,
    error,
    refetch: loadOverdueAccounts,
    forceRefresh,
  };
};

export const useClientPendingAccounts = (clientId?: number) => {
  const [clientAccounts, setClientAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (clientId) {
      loadClientAccounts();
    }
  }, [clientId, refreshTrigger]);

  return {
    clientAccounts,
    loading,
    error,
    refetch: loadClientAccounts,
    forceRefresh,
  };
};

export const useSupplierPendingAccounts = (supplierId?: number) => {
  const [supplierAccounts, setSupplierAccounts] = useState<PendingAccount[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (supplierId) {
      loadSupplierAccounts();
    }
  }, [supplierId, refreshTrigger]);

  return {
    supplierAccounts,
    loading,
    error,
    refetch: loadSupplierAccounts,
    forceRefresh,
  };
};

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    loadTotals();
  }, [companyId, refreshTrigger]);

  return {
    totals,
    loading,
    error,
    refetch: loadTotals,
    forceRefresh,
  };
};

export const useDueDateManager = (
  companyId?: number,
  daysRange: number = 30
) => {
  const [upcomingAccounts, setUpcomingAccounts] = useState<PendingAccount[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (companyId) {
      loadUpcomingAccounts();
    }
  }, [companyId, daysRange, refreshTrigger]);

  return {
    upcomingAccounts,
    loading,
    error,
    refetch: loadUpcomingAccounts,
    forceRefresh,
  };
};

export const useFinancialDashboard = (companyId?: number) => {
  const {
    totals,
    loading: totalsLoading,
    error: totalsError,
    forceRefresh: refreshTotals,
  } = usePendingAccountsTotals(companyId);

  const {
    overdueAccounts,
    loading: overdueLoading,
    error: overdueError,
    forceRefresh: refreshOverdue,
  } = useOverdueAccounts(companyId);

  const {
    upcomingAccounts,
    loading: upcomingLoading,
    error: upcomingError,
    forceRefresh: refreshUpcoming,
  } = useDueDateManager(companyId, 7);

  const loading = totalsLoading || overdueLoading || upcomingLoading;
  const error = totalsError || overdueError || upcomingError;

  const forceRefresh = () => {
    refreshTotals();
    refreshOverdue();
    refreshUpcoming();
  };

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
    criticalAccounts: overdueAccounts.slice(0, 5),
    upcomingDueAccounts: upcomingAccounts.slice(0, 5),
  };

  return {
    dashboardData,
    loading,
    error,
    overdueAccounts,
    upcomingAccounts,
    forceRefresh,
  };
};
