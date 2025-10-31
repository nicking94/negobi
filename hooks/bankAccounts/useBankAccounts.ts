import { useState, useEffect } from "react";
import {
  bankAccountService,
  BankAccount,
  CreateBankAccountData,
  UpdateBankAccountData,
  GetBankAccountsParams,
} from "../../services/bankAccounts/bankAccounts.service";

export interface UseBankAccountsFilters {
  companyId: number;
  search?: string;
  name?: string;
  code?: string;
}

export const useBankAccounts = (filters: UseBankAccountsFilters) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBankAccounts = async (
    customFilters?: Partial<UseBankAccountsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetBankAccountsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const accountsData = await bankAccountService.getBankAccounts(
        combinedFilters
      );

      if (Array.isArray(accountsData)) {
        setBankAccounts(accountsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", accountsData);
        setBankAccounts([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cuentas bancarias"
      );
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const createBankAccount = async (
    accountData: CreateBankAccountData
  ): Promise<BankAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const newAccount = await bankAccountService.createBankAccount(
        accountData
      );
      setBankAccounts((prev) => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear cuenta bancaria"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBankAccount = async (
    id: string,
    updates: UpdateBankAccountData
  ): Promise<BankAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedAccount = await bankAccountService.updateBankAccount(
        id,
        updates
      );
      setBankAccounts((prev) =>
        prev.map((account) =>
          account.id.toString() === id ? updatedAccount : account
        )
      );
      return updatedAccount;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar cuenta bancaria"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBankAccount = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await bankAccountService.deleteBankAccount(id);
      setBankAccounts((prev) =>
        prev.filter((account) => account.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar cuenta bancaria"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBankAccountById = async (
    id: string
  ): Promise<BankAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const account = await bankAccountService.getBankAccountById(id);
      return account;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener cuenta bancaria"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.companyId) {
      loadBankAccounts();
    }
  }, [filters.companyId, filters.search, filters.name, filters.code]);

  return {
    bankAccounts,
    loading,
    error,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    getBankAccountById,
    refetch: loadBankAccounts,
  };
};

export const useActiveBankAccounts = (companyId: number) => {
  const [activeAccounts, setActiveAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveAccounts = async (id?: number) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const accounts = await bankAccountService.getActiveBankAccounts(
        targetCompanyId
      );
      setActiveAccounts(accounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas bancarias activas"
      );
      setActiveAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadActiveAccounts();
    }
  }, [companyId]);

  return {
    activeBankAccounts: activeAccounts,
    loading,
    error,
    refetch: loadActiveAccounts,
  };
};

export const useBankAccountsByPaymentMethod = (
  companyId: number,
  paymentMethodId?: number
) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccountsByPaymentMethod = async (
    id?: number,
    methodId?: number
  ) => {
    const targetCompanyId = id || companyId;
    const targetPaymentMethodId = methodId || paymentMethodId;

    if (!targetCompanyId || !targetPaymentMethodId) {
      setError("companyId y paymentMethodId son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const methodAccounts =
        await bankAccountService.getBankAccountsByPaymentMethod(
          targetCompanyId,
          targetPaymentMethodId
        );
      setAccounts(methodAccounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar cuentas por método de pago"
      );
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && paymentMethodId) {
      loadAccountsByPaymentMethod();
    }
  }, [companyId, paymentMethodId]);

  return {
    bankAccountsByPaymentMethod: accounts,
    loading,
    error,
    refetch: loadAccountsByPaymentMethod,
  };
};

export const useBankAccountOptions = (companyId: number) => {
  const { activeBankAccounts, loading, error, refetch } =
    useActiveBankAccounts(companyId);

  const bankAccountOptions = activeBankAccounts.map((account) => ({
    value: account.id,
    label: `${account.bank_name} - ${account.account_number} (${account.account_holder_name})`,
    bank_name: account.bank_name,
    account_number: account.account_number,
    account_type: account.account_type,
    account_holder_name: account.account_holder_name,
    payment_method_id: account.payment_method_id,
  }));

  return {
    bankAccountOptions,
    loading,
    error,
    refetch,
  };
};
