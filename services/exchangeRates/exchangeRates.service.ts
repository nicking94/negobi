import api from "../../utils/api";
import {
  PostExchangeRate,
  GetExchangeRates,
  PatchExchangeRate,
  DeleteExchangeRate,
} from "../exchangeRates/exchangeRates.route";

export interface GetExchangeRatesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  baseCurrencyId?: number;
  targetCurrencyId?: number;
  exchange_rate?: number;
  rate_date?: string;
  source?: string;
  is_active?: boolean;
}

export interface ExchangeRate {
  id: number;
  exchange_rate: number;
  rate_date: string;
  rate_time: string;
  source: string;
  is_active: boolean;
  baseCurrencyId?: number;
  targetCurrencyId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateExchangeRateData {
  baseCurrencyId: number;
  targetCurrencyId: number;
  exchange_rate: number;
  rate_date: string;
  rate_time?: string;
  source?: string;
  is_active?: boolean;
}

export interface UpdateExchangeRateData {
  baseCurrencyId?: number;
  targetCurrencyId?: number;
  exchange_rate?: number;
  rate_date?: string;
  rate_time?: string;
  source?: string;
  is_active?: boolean;
}

export interface ExchangeRateResponse {
  success: boolean;
  data: ExchangeRate;
}

export interface ExchangeRatesListResponse {
  success: boolean;
  data: ExchangeRate[];
}

export interface PaginatedExchangeRatesResponse {
  success: boolean;
  data: {
    data: ExchangeRate[];
    totalPages: number;
    total: number;
  };
}

export const exchangeRateService = {
  createExchangeRate: async (
    exchangeRateData: CreateExchangeRateData
  ): Promise<ExchangeRate> => {
    const response = await api.post(PostExchangeRate, exchangeRateData);
    return response.data.data;
  },

  getExchangeRates: async (
    params?: GetExchangeRatesParams
  ): Promise<ExchangeRate[]> => {
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
    if (params?.baseCurrencyId) {
      queryParams.append("baseCurrencyId", params.baseCurrencyId.toString());
    }
    if (params?.targetCurrencyId) {
      queryParams.append(
        "targetCurrencyId",
        params.targetCurrencyId.toString()
      );
    }
    if (params?.exchange_rate) {
      queryParams.append("exchange_rate", params.exchange_rate.toString());
    }
    if (params?.rate_date) {
      queryParams.append("rate_date", params.rate_date);
    }
    if (params?.source) {
      queryParams.append("source", params.source);
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetExchangeRates}?${queryParams}`);
    return response.data.data;
  },

  updateExchangeRate: async (
    id: string,
    updates: UpdateExchangeRateData
  ): Promise<ExchangeRate> => {
    const response = await api.patch(`${PatchExchangeRate}/${id}`, updates);
    return response.data.data;
  },

  deleteExchangeRate: async (id: string): Promise<void> => {
    await api.delete(`${DeleteExchangeRate}/${id}`);
  },

  getExchangeRateById: async (id: string): Promise<ExchangeRate> => {
    const response = await api.get(`${GetExchangeRates}/${id}`);
    return response.data.data;
  },

  getActiveExchangeRates: async (): Promise<ExchangeRate[]> => {
    return exchangeRateService.getExchangeRates({
      is_active: true,
      itemsPerPage: 10,
    });
  },

  getExchangeRatesByCurrencyPair: async (
    baseCurrencyId: number,
    targetCurrencyId: number
  ): Promise<ExchangeRate[]> => {
    return exchangeRateService.getExchangeRates({
      baseCurrencyId,
      targetCurrencyId,
      itemsPerPage: 10,
    });
  },

  getLatestExchangeRate: async (
    baseCurrencyId: number,
    targetCurrencyId: number
  ): Promise<ExchangeRate | null> => {
    try {
      const exchangeRates = await exchangeRateService.getExchangeRates({
        baseCurrencyId,
        targetCurrencyId,
        is_active: true,
        itemsPerPage: 1,
        order: "DESC",
      });
      return exchangeRates.length > 0 ? exchangeRates[0] : null;
    } catch (error) {
      console.error("Error fetching latest exchange rate:", error);
      return null;
    }
  },

  getExchangeRatesByDate: async (date: string): Promise<ExchangeRate[]> => {
    return exchangeRateService.getExchangeRates({
      rate_date: date,
      itemsPerPage: 10,
    });
  },

  getExchangeRatesByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<ExchangeRate[]> => {
    const allRates = await exchangeRateService.getExchangeRates({
      itemsPerPage: 100,
    });

    return allRates.filter((rate) => {
      const rateDate = new Date(rate.rate_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return rateDate >= start && rateDate <= end;
    });
  },

  convertCurrency: async (
    amount: number,
    fromCurrencyId: number,
    toCurrencyId: number
  ): Promise<{ amount: number; exchange_rate: number } | null> => {
    try {
      if (fromCurrencyId === toCurrencyId) {
        return { amount, exchange_rate: 1 };
      }

      const exchangeRate = await exchangeRateService.getLatestExchangeRate(
        fromCurrencyId,
        toCurrencyId
      );

      if (exchangeRate) {
        const convertedAmount = amount * exchangeRate.exchange_rate;
        return {
          amount: convertedAmount,
          exchange_rate: exchangeRate.exchange_rate,
        };
      }

      return null;
    } catch (error) {
      console.error("Error converting currency:", error);
      return null;
    }
  },

  createMultipleExchangeRates: async (
    exchangeRatesData: CreateExchangeRateData[]
  ): Promise<ExchangeRate[]> => {
    const createdRates: ExchangeRate[] = [];

    for (const rateData of exchangeRatesData) {
      try {
        const createdRate = await exchangeRateService.createExchangeRate(
          rateData
        );
        createdRates.push(createdRate);
      } catch (error) {
        console.error(`Error creating exchange rate:`, error);
        throw error;
      }
    }

    return createdRates;
  },
};
