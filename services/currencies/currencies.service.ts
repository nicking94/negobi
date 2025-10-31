import api from "../../utils/api";
import {
  PostCurrency,
  GetCurrencies,
  PatchCurrency,
  DeleteCurrency,
} from "../currencies/currencies.route";

export interface GetCurrenciesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  currency_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  is_main_currency?: boolean;
  is_active?: boolean;
}

export interface Currency {
  id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  decimal_places: number;
  is_main_currency: boolean;
  is_active: boolean;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateCurrencyData {
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  decimal_places?: number;
  is_main_currency?: boolean;
  is_active?: boolean;
}

export interface UpdateCurrencyData {
  currency_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  decimal_places?: number;
  is_main_currency?: boolean;
  is_active?: boolean;
}

export interface CurrencyResponse {
  success: boolean;
  data: Currency;
}

export interface CurrenciesListResponse {
  success: boolean;
  data: Currency[];
}

export interface PaginatedCurrenciesResponse {
  success: boolean;
  data: {
    data: Currency[];
    totalPages: number;
    total: number;
  };
}

export const currencyService = {
  createCurrency: async (
    currencyData: CreateCurrencyData
  ): Promise<Currency> => {
    const response = await api.post(PostCurrency, currencyData);
    return response.data.data;
  },

  getCurrencies: async (params?: GetCurrenciesParams): Promise<Currency[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.currency_name) {
      queryParams.append("currency_name", params.currency_name);
    }
    if (params?.currency_code) {
      queryParams.append("currency_code", params.currency_code);
    }
    if (params?.currency_symbol) {
      queryParams.append("currency_symbol", params.currency_symbol);
    }
    if (params?.is_main_currency !== undefined) {
      queryParams.append(
        "is_main_currency",
        params.is_main_currency.toString()
      );
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetCurrencies}?${queryParams}`);
    return response.data.data;
  },

  updateCurrency: async (
    id: string,
    updates: UpdateCurrencyData
  ): Promise<Currency> => {
    const response = await api.patch(`${PatchCurrency}/${id}`, updates);
    return response.data.data;
  },

  deleteCurrency: async (id: string): Promise<void> => {
    await api.delete(`${DeleteCurrency}/${id}`);
  },

  getCurrencyById: async (id: string): Promise<Currency> => {
    const response = await api.get(`${GetCurrencies}/${id}`);
    return response.data.data;
  },

  getActiveCurrencies: async (): Promise<Currency[]> => {
    return currencyService.getCurrencies({
      is_active: true,
      itemsPerPage: 10,
    });
  },

  getMainCurrency: async (): Promise<Currency | null> => {
    try {
      const currencies = await currencyService.getCurrencies({
        is_main_currency: true,
        itemsPerPage: 1,
      });
      return currencies.length > 0 ? currencies[0] : null;
    } catch (error) {
      console.error("Error fetching main currency:", error);
      return null;
    }
  },

  getCurrencyByCode: async (code: string): Promise<Currency | null> => {
    try {
      const currencies = await currencyService.getCurrencies({
        currency_code: code,
        itemsPerPage: 1,
      });
      return currencies.length > 0 ? currencies[0] : null;
    } catch (error) {
      console.error("Error fetching currency by code:", error);
      return null;
    }
  },
};
