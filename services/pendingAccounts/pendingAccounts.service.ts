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
  status: AccountStatus;

  // Campos opcionales para creación
  clientId?: number;
  supplierId?: number;
  documentId?: number;
  currencyId?: number;
  notes?: string;
  external_code?: string;
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
  external_code?: string;
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

// Función para formatear números decimales
const formatDecimalForAPI = (value: number | undefined): number => {
  if (value === undefined || value === null) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

class PendingAccountsService {
  // Crear una nueva cuenta pendiente
  async create(data: CreatePendingAccountData): Promise<PendingAccount> {
    // Formatear los campos decimales antes de enviar
    const formattedData = {
      ...data,
      amount_due: formatDecimalForAPI(data.amount_due),
      balance_due: formatDecimalForAPI(data.balance_due),
    };

    const response = await api.post(PostPendingAccount, formattedData);
    return response.data.data;
  }

  // Obtener todas las cuentas pendientes
  async getAll(params?: GetPendingAccountsParams): Promise<PendingAccount[]> {
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
  }

  // Actualizar una cuenta pendiente
  async update(
    id: string,
    data: UpdatePendingAccountData
  ): Promise<PendingAccount> {
    // Formatear los campos decimales antes de enviar
    const formattedData: any = { ...data };

    if (data.amount_due !== undefined) {
      formattedData.amount_due = formatDecimalForAPI(data.amount_due);
    }
    if (data.balance_due !== undefined) {
      formattedData.balance_due = formatDecimalForAPI(data.balance_due);
    }

    const response = await api.patch(
      `${PatchPendingAccount}/${id}`,
      formattedData
    );
    return response.data.data;
  }

  // Eliminar una cuenta pendiente
  async delete(id: string): Promise<void> {
    await api.delete(`${DeletePendingAccount}/${id}`);
  }

  // Obtener una cuenta pendiente por ID
  async getById(id: string): Promise<PendingAccount> {
    const response = await api.get(`${GetPendingAccounts}/${id}`);
    return response.data.data;
  }

  // Métodos adicionales útiles
  async getReceivableAccounts(companyId?: number): Promise<PendingAccount[]> {
    const params: GetPendingAccountsParams = {
      account_type: "receivable",
      itemsPerPage: 100,
    };
    if (companyId) {
      params.companyId = companyId;
    }
    return this.getAll(params);
  }

  async getPayableAccounts(companyId?: number): Promise<PendingAccount[]> {
    const params: GetPendingAccountsParams = {
      account_type: "payable",
      itemsPerPage: 100,
    };
    if (companyId) {
      params.companyId = companyId;
    }
    return this.getAll(params);
  }

  async getOverdueAccounts(companyId?: number): Promise<PendingAccount[]> {
    const allAccounts = await this.getAll({
      companyId,
      itemsPerPage: 100,
    });

    const today = new Date();
    return allAccounts.filter((account) => {
      const dueDate = new Date(account.due_date);
      return dueDate < today && account.balance_due > 0;
    });
  }

  async getAccountsByClient(clientId: number): Promise<PendingAccount[]> {
    return this.getAll({
      clientId,
      itemsPerPage: 100,
    });
  }

  async getAccountsBySupplier(supplierId: number): Promise<PendingAccount[]> {
    return this.getAll({
      supplierId,
      itemsPerPage: 100,
    });
  }

  async getAccountsByDueDateRange(
    startDate: string,
    endDate: string,
    companyId?: number
  ): Promise<PendingAccount[]> {
    const allAccounts = await this.getAll({
      companyId,
      itemsPerPage: 100,
    });

    return allAccounts.filter((account) => {
      const dueDate = new Date(account.due_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return dueDate >= start && dueDate <= end;
    });
  }

  // Calcular totales
  async calculateTotals(companyId?: number): Promise<{
    totalReceivable: number;
    totalPayable: number;
    totalOverdue: number;
    totalOutstanding: number;
  }> {
    const allAccounts = await this.getAll({
      companyId,
      itemsPerPage: 1000, // Alto para obtener todas las cuentas
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
  }

  // Aplicar pago a cuenta pendiente
  async applyPayment(
    accountId: string,
    paymentAmount: number
  ): Promise<PendingAccount> {
    const account = await this.getById(accountId);

    const newBalance = Math.max(0, account.balance_due - paymentAmount);
    const newStatus =
      newBalance === 0
        ? "Paid"
        : newBalance < account.balance_due
        ? "Partially Paid"
        : account.status;

    return this.update(accountId, {
      balance_due: newBalance,
      status: newStatus,
    });
  }
}

export const pendingAccountsService = new PendingAccountsService();

// Exportar también los métodos legacy para compatibilidad
export const pendingAccountService = {
  createPendingAccount: (data: CreatePendingAccountData) =>
    pendingAccountsService.create(data),
  getPendingAccounts: (params?: GetPendingAccountsParams) =>
    pendingAccountsService.getAll(params),
  updatePendingAccount: (id: string, data: UpdatePendingAccountData) =>
    pendingAccountsService.update(id, data),
  deletePendingAccount: (id: string) => pendingAccountsService.delete(id),
  getPendingAccountById: (id: string) => pendingAccountsService.getById(id),
  getReceivableAccounts: (companyId?: number) =>
    pendingAccountsService.getReceivableAccounts(companyId),
  getPayableAccounts: (companyId?: number) =>
    pendingAccountsService.getPayableAccounts(companyId),
  getOverdueAccounts: (companyId?: number) =>
    pendingAccountsService.getOverdueAccounts(companyId),
  getAccountsByClient: (clientId: number) =>
    pendingAccountsService.getAccountsByClient(clientId),
  getAccountsBySupplier: (supplierId: number) =>
    pendingAccountsService.getAccountsBySupplier(supplierId),
  getAccountsByDueDateRange: (
    startDate: string,
    endDate: string,
    companyId?: number
  ) =>
    pendingAccountsService.getAccountsByDueDateRange(
      startDate,
      endDate,
      companyId
    ),
  calculateTotals: (companyId?: number) =>
    pendingAccountsService.calculateTotals(companyId),
  applyPayment: (accountId: string, paymentAmount: number) =>
    pendingAccountsService.applyPayment(accountId, paymentAmount),
};
