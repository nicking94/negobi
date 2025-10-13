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
  // Campos del response (GET)
  id: number;
  exchange_rate: number;
  rate_date: string;
  rate_time: string;
  source: string;
  is_active: boolean;

  // Campos de relación
  baseCurrencyId?: number;
  targetCurrencyId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateExchangeRateData {
  // Campos requeridos para crear un tipo de cambio
  baseCurrencyId: number;
  targetCurrencyId: number;
  exchange_rate: number;
  rate_date: string;

  // Campos opcionales para creación
  rate_time?: string;
  source?: string;
  is_active?: boolean;
}

export interface UpdateExchangeRateData {
  // Todos los campos son opcionales para actualización
  baseCurrencyId?: number;
  targetCurrencyId?: number;
  exchange_rate?: number;
  rate_date?: string;
  rate_time?: string;
  source?: string;
  is_active?: boolean;
}

// Response interfaces
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
  // Crear un nuevo tipo de cambio
  createExchangeRate: async (
    exchangeRateData: CreateExchangeRateData
  ): Promise<ExchangeRate> => {
    const response = await api.post(PostExchangeRate, exchangeRateData);
    return response.data.data;
  },

  // Obtener todos los tipos de cambio
  getExchangeRates: async (
    params?: GetExchangeRatesParams
  ): Promise<ExchangeRate[]> => {
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

  // Actualizar un tipo de cambio
  updateExchangeRate: async (
    id: string,
    updates: UpdateExchangeRateData
  ): Promise<ExchangeRate> => {
    const response = await api.patch(`${PatchExchangeRate}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un tipo de cambio
  deleteExchangeRate: async (id: string): Promise<void> => {
    await api.delete(`${DeleteExchangeRate}/${id}`);
  },

  // Obtener un tipo de cambio por ID
  getExchangeRateById: async (id: string): Promise<ExchangeRate> => {
    const response = await api.get(`${GetExchangeRates}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
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
    // Nota: Esto podría requerir un endpoint específico en la API
    // Por ahora, obtenemos todos y filtramos por fecha
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

  // Convertir moneda
  convertCurrency: async (
    amount: number,
    fromCurrencyId: number,
    toCurrencyId: number
  ): Promise<{ amount: number; exchange_rate: number } | null> => {
    try {
      // Si es la misma moneda, no hay conversión
      if (fromCurrencyId === toCurrencyId) {
        return { amount, exchange_rate: 1 };
      }

      // Buscar el tipo de cambio más reciente
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

  // Crear tipos de cambio en lote
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
