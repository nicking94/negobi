import { useState, useEffect } from "react";
import {
  exchangeRateService,
  ExchangeRate,
  CreateExchangeRateData,
  UpdateExchangeRateData,
  GetExchangeRatesParams,
} from "../../services/exchangeRates/exchangeRates.service";

// Definir el tipo para los filtros del hook
export interface UseExchangeRatesFilters {
  baseCurrencyId?: number;
  targetCurrencyId?: number;
  exchange_rate?: number;
  rate_date?: string;
  source?: string;
  is_active?: boolean;
  search?: string;
}

export const useExchangeRates = (filters: UseExchangeRatesFilters = {}) => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los tipos de cambio con filtros
  const loadExchangeRates = async (
    customFilters?: Partial<UseExchangeRatesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetExchangeRatesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log(
        "🔵 Enviando parámetros para tipos de cambio:",
        combinedFilters
      );

      const exchangeRatesData = await exchangeRateService.getExchangeRates(
        combinedFilters
      );
      console.log("🟢 Datos de tipos de cambio recibidos:", exchangeRatesData);

      if (Array.isArray(exchangeRatesData)) {
        setExchangeRates(exchangeRatesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", exchangeRatesData);
        setExchangeRates([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar tipos de cambio"
      );
      setExchangeRates([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear tipo de cambio
  const createExchangeRate = async (
    exchangeRateData: CreateExchangeRateData
  ): Promise<ExchangeRate | null> => {
    try {
      setLoading(true);
      setError(null);
      const newExchangeRate = await exchangeRateService.createExchangeRate(
        exchangeRateData
      );
      setExchangeRates((prev) => [...prev, newExchangeRate]);
      return newExchangeRate;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear tipo de cambio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar tipo de cambio
  const updateExchangeRate = async (
    id: string,
    updates: UpdateExchangeRateData
  ): Promise<ExchangeRate | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedExchangeRate = await exchangeRateService.updateExchangeRate(
        id,
        updates
      );
      setExchangeRates((prev) =>
        prev.map((rate) =>
          rate.id.toString() === id ? updatedExchangeRate : rate
        )
      );
      return updatedExchangeRate;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar tipo de cambio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tipo de cambio
  const deleteExchangeRate = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await exchangeRateService.deleteExchangeRate(id);
      setExchangeRates((prev) =>
        prev.filter((rate) => rate.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar tipo de cambio"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener tipo de cambio por ID
  const getExchangeRateById = async (
    id: string
  ): Promise<ExchangeRate | null> => {
    try {
      setLoading(true);
      setError(null);
      const exchangeRate = await exchangeRateService.getExchangeRateById(id);
      return exchangeRate;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener tipo de cambio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear múltiples tipos de cambio
  const createMultipleExchangeRates = async (
    exchangeRatesData: CreateExchangeRateData[]
  ): Promise<ExchangeRate[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdRates =
        await exchangeRateService.createMultipleExchangeRates(
          exchangeRatesData
        );
      setExchangeRates((prev) => [...prev, ...createdRates]);
      return createdRates;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples tipos de cambio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Convertir moneda
  const convertCurrency = async (
    amount: number,
    fromCurrencyId: number,
    toCurrencyId: number
  ): Promise<{ amount: number; exchange_rate: number } | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await exchangeRateService.convertCurrency(
        amount,
        fromCurrencyId,
        toCurrencyId
      );
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al convertir moneda"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos de cambio al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadExchangeRates();
  }, [
    filters.baseCurrencyId,
    filters.targetCurrencyId,
    filters.exchange_rate,
    filters.rate_date,
    filters.source,
    filters.is_active,
    filters.search,
  ]);

  return {
    exchangeRates,
    loading,
    error,
    createExchangeRate,
    updateExchangeRate,
    deleteExchangeRate,
    getExchangeRateById,
    createMultipleExchangeRates,
    convertCurrency,
    refetch: loadExchangeRates,
  };
};

// Hook especializado para tipos de cambio activos
export const useActiveExchangeRates = () => {
  const [activeExchangeRates, setActiveExchangeRates] = useState<
    ExchangeRate[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const rates = await exchangeRateService.getActiveExchangeRates();
      setActiveExchangeRates(rates);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de cambio activos"
      );
      setActiveExchangeRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveExchangeRates();
  }, []);

  return {
    activeExchangeRates,
    loading,
    error,
    refetch: loadActiveExchangeRates,
  };
};

// Hook especializado para un par de monedas específico
export const useExchangeRatesByCurrencyPair = (
  baseCurrencyId?: number,
  targetCurrencyId?: number
) => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExchangeRatesByCurrencyPair = async (
    baseId?: number,
    targetId?: number
  ) => {
    const targetBaseId = baseId || baseCurrencyId;
    const targetTargetId = targetId || targetCurrencyId;

    if (!targetBaseId || !targetTargetId) {
      setError("baseCurrencyId y targetCurrencyId son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const rates = await exchangeRateService.getExchangeRatesByCurrencyPair(
        targetBaseId,
        targetTargetId
      );
      setExchangeRates(rates);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de cambio del par de monedas"
      );
      setExchangeRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseCurrencyId && targetCurrencyId) {
      loadExchangeRatesByCurrencyPair();
    }
  }, [baseCurrencyId, targetCurrencyId]);

  return {
    exchangeRates,
    loading,
    error,
    refetch: loadExchangeRatesByCurrencyPair,
  };
};

// Hook para el tipo de cambio más reciente de un par
export const useLatestExchangeRate = (
  baseCurrencyId?: number,
  targetCurrencyId?: number
) => {
  const [latestRate, setLatestRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatestExchangeRate = async (baseId?: number, targetId?: number) => {
    const targetBaseId = baseId || baseCurrencyId;
    const targetTargetId = targetId || targetCurrencyId;

    if (!targetBaseId || !targetTargetId) {
      setError("baseCurrencyId y targetCurrencyId son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const rate = await exchangeRateService.getLatestExchangeRate(
        targetBaseId,
        targetTargetId
      );
      setLatestRate(rate);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipo de cambio más reciente"
      );
      setLatestRate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseCurrencyId && targetCurrencyId) {
      loadLatestExchangeRate();
    }
  }, [baseCurrencyId, targetCurrencyId]);

  return {
    latestRate,
    loading,
    error,
    refetch: loadLatestExchangeRate,
  };
};

// Hook para conversión de moneda en tiempo real
export const useCurrencyConverter = () => {
  const [conversionResult, setConversionResult] = useState<{
    amount: number;
    exchange_rate: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async (
    amount: number,
    fromCurrencyId: number,
    toCurrencyId: number
  ) => {
    if (!fromCurrencyId || !toCurrencyId) {
      setError("fromCurrencyId y toCurrencyId son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await exchangeRateService.convertCurrency(
        amount,
        fromCurrencyId,
        toCurrencyId
      );
      setConversionResult(result);
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al convertir moneda"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    conversionResult,
    loading,
    error,
    convert,
  };
};

// Hook para tipos de cambio por fecha
export const useExchangeRatesByDate = (date?: string) => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExchangeRatesByDate = async (targetDate?: string) => {
    const targetDateToUse = targetDate || date;
    if (!targetDateToUse) {
      setError("date es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const rates = await exchangeRateService.getExchangeRatesByDate(
        targetDateToUse
      );
      setExchangeRates(rates);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de cambio por fecha"
      );
      setExchangeRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      loadExchangeRatesByDate();
    }
  }, [date]);

  return {
    exchangeRates,
    loading,
    error,
    refetch: loadExchangeRatesByDate,
  };
};

// Hook para gestión de tipos de cambio históricos
export const useExchangeRateHistory = (
  baseCurrencyId?: number,
  targetCurrencyId?: number,
  days: number = 30
) => {
  const [history, setHistory] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async (
    baseId?: number,
    targetId?: number,
    numDays?: number
  ) => {
    const targetBaseId = baseId || baseCurrencyId;
    const targetTargetId = targetId || targetCurrencyId;
    const targetDays = numDays || days;

    if (!targetBaseId || !targetTargetId) {
      setError("baseCurrencyId y targetCurrencyId son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - targetDays);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const rates = await exchangeRateService.getExchangeRatesByDateRange(
        startDateStr,
        endDateStr
      );

      // Filtrar por el par de monedas específico
      const filteredRates = rates.filter(
        (rate) =>
          rate.baseCurrencyId === targetBaseId &&
          rate.targetCurrencyId === targetTargetId
      );

      setHistory(filteredRates);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar historial de tipos de cambio"
      );
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseCurrencyId && targetCurrencyId) {
      loadHistory();
    }
  }, [baseCurrencyId, targetCurrencyId, days]);

  return {
    history,
    loading,
    error,
    refetch: loadHistory,
  };
};
