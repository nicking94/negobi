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
  companyId: number;
  name?: string;
  code?: string;
}

export interface BankAccount {
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
  company_id?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateBankAccountData {
  company_id: number;
  payment_method_id: number;
  bank_name: string;
  account_type: string;
  account_number: string;
  account_holder_name: string;

  tax_id_holder?: string;
  swift_code?: string;
  iban?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateBankAccountData {
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
  createBankAccount: async (
    bankAccountData: CreateBankAccountData
  ): Promise<BankAccount> => {
    const response = await api.post(PostBankAccount, bankAccountData);
    return response.data.data;
  },

  getBankAccounts: async (
    params: GetBankAccountsParams
  ): Promise<BankAccount[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    queryParams.append("companyId", params.companyId.toString());

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

  updateBankAccount: async (
    id: string,
    updates: UpdateBankAccountData
  ): Promise<BankAccount> => {
    const response = await api.patch(`${PatchBankAccount}/${id}`, updates);
    return response.data.data;
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await api.delete(`${DeleteBankAccount}/${id}`);
  },

  getBankAccountById: async (id: string): Promise<BankAccount> => {
    const response = await api.get(`${GetBankAccounts}/${id}`);
    return response.data.data;
  },

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
