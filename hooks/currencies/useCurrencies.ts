import { useState, useEffect } from "react";
import {
  currencyService,
  Currency,
  CreateCurrencyData,
  UpdateCurrencyData,
  GetCurrenciesParams,
} from "../../services/currencies/currencies.service";

// Definir el tipo para los filtros del hook
export interface UseCurrenciesFilters {
  search?: string;
  currency_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  is_main_currency?: boolean;
  is_active?: boolean;
}

export const useCurrencies = (filters: UseCurrenciesFilters = {}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las monedas con filtros
  const loadCurrencies = async (
    customFilters?: Partial<UseCurrenciesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetCurrenciesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log("🔵 Enviando parámetros para monedas:", combinedFilters);

      const currenciesData = await currencyService.getCurrencies(
        combinedFilters
      );
      console.log("🟢 Datos de monedas recibidos:", currenciesData);

      if (Array.isArray(currenciesData)) {
        setCurrencies(currenciesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", currenciesData);
        setCurrencies([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar monedas");
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear moneda
  const createCurrency = async (
    currencyData: CreateCurrencyData
  ): Promise<Currency | null> => {
    try {
      setLoading(true);
      setError(null);
      const newCurrency = await currencyService.createCurrency(currencyData);
      setCurrencies((prev) => [...prev, newCurrency]);
      return newCurrency;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear moneda");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar moneda
  const updateCurrency = async (
    id: string,
    updates: UpdateCurrencyData
  ): Promise<Currency | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedCurrency = await currencyService.updateCurrency(id, updates);
      setCurrencies((prev) =>
        prev.map((currency) =>
          currency.id.toString() === id ? updatedCurrency : currency
        )
      );
      return updatedCurrency;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar moneda"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar moneda
  const deleteCurrency = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await currencyService.deleteCurrency(id);
      setCurrencies((prev) =>
        prev.filter((currency) => currency.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar moneda");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener moneda por ID
  const getCurrencyById = async (id: string): Promise<Currency | null> => {
    try {
      setLoading(true);
      setError(null);
      const currency = await currencyService.getCurrencyById(id);
      return currency;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener moneda");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener moneda por código
  const getCurrencyByCode = async (code: string): Promise<Currency | null> => {
    try {
      setLoading(true);
      setError(null);
      const currency = await currencyService.getCurrencyByCode(code);
      return currency;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener moneda por código"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar monedas al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadCurrencies();
  }, [
    filters.search,
    filters.currency_name,
    filters.currency_code,
    filters.currency_symbol,
    filters.is_main_currency,
    filters.is_active,
  ]);

  return {
    currencies,
    loading,
    error,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    getCurrencyById,
    getCurrencyByCode,
    refetch: loadCurrencies,
  };
};

// Hook especializado para monedas activas
export const useActiveCurrencies = () => {
  const [activeCurrencies, setActiveCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const currencies = await currencyService.getActiveCurrencies();
      setActiveCurrencies(currencies);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar monedas activas"
      );
      setActiveCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveCurrencies();
  }, []);

  return {
    activeCurrencies,
    loading,
    error,
    refetch: loadActiveCurrencies,
  };
};

// Hook especializado para moneda principal
export const useMainCurrency = () => {
  const [mainCurrency, setMainCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMainCurrency = async () => {
    try {
      setLoading(true);
      setError(null);
      const currency = await currencyService.getMainCurrency();
      setMainCurrency(currency);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar moneda principal"
      );
      setMainCurrency(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMainCurrency();
  }, []);

  return {
    mainCurrency,
    loading,
    error,
    refetch: loadMainCurrency,
  };
};

// Hook para selección de monedas (para dropdowns)
export const useCurrencyOptions = () => {
  const { activeCurrencies, loading, error, refetch } = useActiveCurrencies();

  const currencyOptions = activeCurrencies.map((currency) => ({
    value: currency.id,
    label: `${currency.currency_name} (${currency.currency_code})`,
    symbol: currency.currency_symbol,
    code: currency.currency_code,
    decimal_places: currency.decimal_places,
  }));

  return {
    currencyOptions,
    loading,
    error,
    refetch,
  };
};
