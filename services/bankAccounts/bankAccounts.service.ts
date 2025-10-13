import api from "../../utils/api";
import {
  PostBankAccount,
  GetBankAccounts,
  PatchBankAccount,
  DeleteBankAccount,
} from "../bankAccounts/bankAccounts.route";

export interface GetBankAccountsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId: number; // Obligatorio según el swagger
  name?: string;
  code?: string;
}

export interface BankAccount {
  // Campos del response (GET)
  id: number;
  payment_method_id: number;
  bank_name: string;
  account_type: string;
  account_number: string;
  account_holder_name: string;
  tax_id_holder: string;
  swift_code: string;
  iban: string;
  is_active: boolean;
  notes: string;

  // Campos de relación
  company_id?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateBankAccountData {
  // Campos requeridos para crear una cuenta bancaria
  company_id: number;
  payment_method_id: number;
  bank_name: string;
  account_type: string;
  account_number: string;
  account_holder_name: string;

  // Campos opcionales para creación
  tax_id_holder?: string;
  swift_code?: string;
  iban?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateBankAccountData {
  // Todos los campos son opcionales para actualización
  company_id?: number;
  payment_method_id?: number;
  bank_name?: string;
  account_type?: string;
  account_number?: string;
  account_holder_name?: string;
  tax_id_holder?: string;
  swift_code?: string;
  iban?: string;
  notes?: string;
  is_active?: boolean;
}

// Response interfaces
export interface BankAccountResponse {
  success: boolean;
  data: BankAccount;
}

export interface BankAccountsListResponse {
  success: boolean;
  data: BankAccount[];
}

export interface PaginatedBankAccountsResponse {
  success: boolean;
  data: {
    data: BankAccount[];
    totalPages: number;
    total: number;
  };
}

export const bankAccountService = {
  // Crear una nueva cuenta bancaria
  createBankAccount: async (
    bankAccountData: CreateBankAccountData
  ): Promise<BankAccount> => {
    const response = await api.post(PostBankAccount, bankAccountData);
    return response.data.data;
  },

  // Obtener todas las cuentas bancarias
  getBankAccounts: async (
    params: GetBankAccountsParams
  ): Promise<BankAccount[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    queryParams.append("companyId", params.companyId.toString());

    // Parámetros opcionales
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.name) {
      queryParams.append("name", params.name);
    }
    if (params?.code) {
      queryParams.append("code", params.code);
    }

    const response = await api.get(`${GetBankAccounts}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar una cuenta bancaria
  updateBankAccount: async (
    id: string,
    updates: UpdateBankAccountData
  ): Promise<BankAccount> => {
    const response = await api.patch(`${PatchBankAccount}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una cuenta bancaria
  deleteBankAccount: async (id: string): Promise<void> => {
    await api.delete(`${DeleteBankAccount}/${id}`);
  },

  // Obtener una cuenta bancaria por ID
  getBankAccountById: async (id: string): Promise<BankAccount> => {
    const response = await api.get(`${GetBankAccounts}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
  getActiveBankAccounts: async (companyId: number): Promise<BankAccount[]> => {
    const accounts = await bankAccountService.getBankAccounts({
      companyId,
      itemsPerPage: 10,
    });
    return accounts.filter((account) => account.is_active);
  },

  getBankAccountsByPaymentMethod: async (
    companyId: number,
    paymentMethodId: number
  ): Promise<BankAccount[]> => {
    const accounts = await bankAccountService.getBankAccounts({
      companyId,
      itemsPerPage: 10,
    });
    return accounts.filter(
      (account) => account.payment_method_id === paymentMethodId
    );
  },

  getBankAccountsByBank: async (
    companyId: number,
    bankName: string
  ): Promise<BankAccount[]> => {
    const accounts = await bankAccountService.getBankAccounts({
      companyId,
      itemsPerPage: 10,
    });
    return accounts.filter((account) =>
      account.bank_name.toLowerCase().includes(bankName.toLowerCase())
    );
  },
};
