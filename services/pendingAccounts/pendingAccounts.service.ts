import api from "../../utils/api";
import {
  PostPendingAccount,
  GetPendingAccounts,
  PatchPendingAccount,
  DeletePendingAccount,
} from "../pendingAccounts/pendingAccounts.route";

export interface GetPendingAccountsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
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
}

// Tipos para los valores enumerados
export type AccountType = "receivable" | "payable";

export type AccountStatus =
  | "Outstanding"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export interface PendingAccount {
  // Campos del response (GET)
  id: number;
  account_type: AccountType;
  amount_due: number;
  balance_due: number;
  due_date: string;
  status: AccountStatus;
  notes: string;

  // Campos de relación (IDs)
  companyId?: number;
  clientId?: number;
  supplierId?: number;
  documentId?: number;
  currencyId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreatePendingAccountData {
  // Campos requeridos para crear una cuenta pendiente
  account_type: AccountType;
  companyId: number;
  amount_due: number;
  balance_due: number;
  due_date: string;

  // Campos opcionales para creación
  clientId?: number;
  supplierId?: number;
  documentId?: number;
  currencyId?: number;
  status?: AccountStatus;
  notes?: string;
}

export interface UpdatePendingAccountData {
  // Todos los campos son opcionales para actualización
  account_type?: AccountType;
  companyId?: number;
  clientId?: number;
  supplierId?: number;
  documentId?: number;
  amount_due?: number;
  balance_due?: number;
  currencyId?: number;
  due_date?: string;
  status?: AccountStatus;
  notes?: string;
}

// Response interfaces
export interface PendingAccountResponse {
  success: boolean;
  data: PendingAccount;
}

export interface PendingAccountsListResponse {
  success: boolean;
  data: PendingAccount[];
}

export interface PaginatedPendingAccountsResponse {
  success: boolean;
  data: {
    data: PendingAccount[];
    totalPages: number;
    total: number;
  };
}

export const pendingAccountService = {
  // Crear una nueva cuenta pendiente
  createPendingAccount: async (
    pendingAccountData: CreatePendingAccountData
  ): Promise<PendingAccount> => {
    const response = await api.post(PostPendingAccount, pendingAccountData);
    return response.data.data;
  },

  // Obtener todas las cuentas pendientes
  getPendingAccounts: async (
    params?: GetPendingAccountsParams
  ): Promise<PendingAccount[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Parámetros opcionales
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.account_type) {
      queryParams.append("account_type", params.account_type);
    }
    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }
    if (params?.clientId) {
      queryParams.append("clientId", params.clientId.toString());
    }
    if (params?.supplierId) {
      queryParams.append("supplierId", params.supplierId.toString());
    }
    if (params?.documentId) {
      queryParams.append("documentId", params.documentId.toString());
    }
    if (params?.amount_due) {
      queryParams.append("amount_due", params.amount_due.toString());
    }
    if (params?.balance_due) {
      queryParams.append("balance_due", params.balance_due.toString());
    }
    if (params?.currencyId) {
      queryParams.append("currencyId", params.currencyId.toString());
    }
    if (params?.due_date) {
      queryParams.append("due_date", params.due_date);
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }

    const response = await api.get(`${GetPendingAccounts}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar una cuenta pendiente
  updatePendingAccount: async (
    id: string,
    updates: UpdatePendingAccountData
  ): Promise<PendingAccount> => {
    const response = await api.patch(`${PatchPendingAccount}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una cuenta pendiente
  deletePendingAccount: async (id: string): Promise<void> => {
    await api.delete(`${DeletePendingAccount}/${id}`);
  },

  // Obtener una cuenta pendiente por ID
  getPendingAccountById: async (id: string): Promise<PendingAccount> => {
    const response = await api.get(`${GetPendingAccounts}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
  getReceivableAccounts: async (
    companyId?: number
  ): Promise<PendingAccount[]> => {
    const params: GetPendingAccountsParams = {
      account_type: "receivable",
      itemsPerPage: 10,
    };
    if (companyId) {
      params.companyId = companyId;
    }
    return pendingAccountService.getPendingAccounts(params);
  },

  getPayableAccounts: async (companyId?: number): Promise<PendingAccount[]> => {
    const params: GetPendingAccountsParams = {
      account_type: "payable",
      itemsPerPage: 10,
    };
    if (companyId) {
      params.companyId = companyId;
    }
    return pendingAccountService.getPendingAccounts(params);
  },

  getOverdueAccounts: async (companyId?: number): Promise<PendingAccount[]> => {
    const allAccounts = await pendingAccountService.getPendingAccounts({
      companyId,
      itemsPerPage: 10,
    });

    const today = new Date();
    return allAccounts.filter((account) => {
      const dueDate = new Date(account.due_date);
      return dueDate < today && account.balance_due > 0;
    });
  },

  getAccountsByClient: async (clientId: number): Promise<PendingAccount[]> => {
    return pendingAccountService.getPendingAccounts({
      clientId,
      itemsPerPage: 10,
    });
  },

  getAccountsBySupplier: async (
    supplierId: number
  ): Promise<PendingAccount[]> => {
    return pendingAccountService.getPendingAccounts({
      supplierId,
      itemsPerPage: 10,
    });
  },

  getAccountsByDueDateRange: async (
    startDate: string,
    endDate: string,
    companyId?: number
  ): Promise<PendingAccount[]> => {
    const allAccounts = await pendingAccountService.getPendingAccounts({
      companyId,
      itemsPerPage: 100,
    });

    return allAccounts.filter((account) => {
      const dueDate = new Date(account.due_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return dueDate >= start && dueDate <= end;
    });
  },

  // Calcular totales
  calculateTotals: async (
    companyId?: number
  ): Promise<{
    totalReceivable: number;
    totalPayable: number;
    totalOverdue: number;
    totalOutstanding: number;
  }> => {
    const allAccounts = await pendingAccountService.getPendingAccounts({
      companyId,
      itemsPerPage: 100,
    });

    const today = new Date();

    const totalReceivable = allAccounts
      .filter((account) => account.account_type === "receivable")
      .reduce((sum, account) => sum + account.balance_due, 0);

    const totalPayable = allAccounts
      .filter((account) => account.account_type === "payable")
      .reduce((sum, account) => sum + account.balance_due, 0);

    const totalOverdue = allAccounts
      .filter((account) => {
        const dueDate = new Date(account.due_date);
        return dueDate < today && account.balance_due > 0;
      })
      .reduce((sum, account) => sum + account.balance_due, 0);

    const totalOutstanding = allAccounts
      .filter((account) => account.balance_due > 0)
      .reduce((sum, account) => sum + account.balance_due, 0);

    return {
      totalReceivable,
      totalPayable,
      totalOverdue,
      totalOutstanding,
    };
  },

  // Aplicar pago a cuenta pendiente
  applyPayment: async (
    accountId: string,
    paymentAmount: number
  ): Promise<PendingAccount> => {
    const account = await pendingAccountService.getPendingAccountById(
      accountId
    );

    const newBalance = Math.max(0, account.balance_due - paymentAmount);
    const newStatus =
      newBalance === 0
        ? "Paid"
        : newBalance < account.balance_due
        ? "Partially Paid"
        : account.status;

    return pendingAccountService.updatePendingAccount(accountId, {
      balance_due: newBalance,
      status: newStatus,
    });
  },
};
