// context/CurrencyContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  exchangeRate: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currencyCode: string) => void;
  availableCurrencies: Currency[];
  formatPrice: (price: number, options?: Intl.NumberFormatOptions) => string;
  convertPrice: (price: number, fromCurrency?: string) => number;
  getExchangeRate: (currencyCode: string) => number;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

// Monedas base con tasas de cambio relativas
const DEFAULT_CURRENCIES: Currency[] = [
  {
    code: "VES",
    name: "Bolívar Soberano",
    symbol: "$", // CAMBIADO: Ahora VES usa $ en lugar de string vacío
    decimalPlaces: 2,
    exchangeRate: 1, // Moneda base
  },
  {
    code: "USD",
    name: "Dólar Estadounidense",
    symbol: "$", // USD también usa $
    decimalPlaces: 2,
    exchangeRate: 36.5, // 1 USD = 36.5 VES
  },
];

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [availableCurrencies, setAvailableCurrencies] =
    useState<Currency[]>(DEFAULT_CURRENCIES);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(
    DEFAULT_CURRENCIES[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Cargar tasas de cambio actualizadas
  const fetchExchangeRates = useCallback(async () => {
    try {
      setIsLoading(true);
      // Aquí puedes llamar a tu API para obtener tasas actualizadas
      // const rates = await currencyService.getExchangeRates();
      // setAvailableCurrencies(updatedCurrencies);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cambiar moneda
  const setCurrency = useCallback(
    (currencyCode: string) => {
      const newCurrency = availableCurrencies.find(
        (c) => c.code === currencyCode
      );
      if (newCurrency) {
        setCurrentCurrency(newCurrency);
        // Opcional: Guardar preferencia en localStorage
        localStorage.setItem("preferredCurrency", currencyCode);
      }
    },
    [availableCurrencies]
  );

  // Convertir precio entre monedas
  const convertPrice = useCallback(
    (price: number, fromCurrency: string = "VES"): number => {
      if (fromCurrency === currentCurrency.code) {
        return price;
      }

      const fromRate = getExchangeRate(fromCurrency);
      const toRate = currentCurrency.exchangeRate;

      // Convertir a la moneda base primero, luego a la moneda objetivo
      const baseAmount = price / fromRate;
      return baseAmount * toRate;
    },
    [currentCurrency.code, availableCurrencies]
  );

  // Obtener tasa de cambio para una moneda específica
  const getExchangeRate = useCallback(
    (currencyCode: string): number => {
      const currency = availableCurrencies.find((c) => c.code === currencyCode);
      return currency?.exchangeRate || 1;
    },
    [availableCurrencies]
  );

  // Formatear precio con la moneda actual - MODIFICADO
  const formatPrice = useCallback(
    (price: number, options?: Intl.NumberFormatOptions): string => {
      const convertedPrice = convertPrice(price);

      // Para VES y USD, usamos formato personalizado con símbolo $
      if (currentCurrency.code === "VES" || currentCurrency.code === "USD") {
        const formattedNumber = new Intl.NumberFormat("es-VE", {
          minimumFractionDigits: currentCurrency.decimalPlaces,
          maximumFractionDigits: currentCurrency.decimalPlaces,
          ...options,
        }).format(convertedPrice);

        // Tanto VES como USD usan el símbolo $
        return `$${formattedNumber}`;
      }

      // Para otras monedas, usar formato estándar
      const formatOptions: Intl.NumberFormatOptions = {
        style: "currency",
        currency: currentCurrency.code,
        minimumFractionDigits: currentCurrency.decimalPlaces,
        maximumFractionDigits: currentCurrency.decimalPlaces,
        ...options,
      };

      try {
        return new Intl.NumberFormat("es-VE", formatOptions).format(
          convertedPrice
        );
      } catch (error) {
        // Fallback si la moneda no es soportada por Intl
        return `${currentCurrency.symbol} ${convertedPrice.toFixed(
          currentCurrency.decimalPlaces
        )}`;
      }
    },
    [currentCurrency, convertPrice]
  );

  // Cargar preferencia guardada al inicializar
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    fetchExchangeRates();

    // Opcional: Actualizar tasas periódicamente
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000); // Cada 5 minutos
    return () => clearInterval(interval);
  }, [fetchExchangeRates, setCurrency]);

  const value: CurrencyContextType = {
    currency: currentCurrency,
    setCurrency,
    availableCurrencies,
    formatPrice,
    convertPrice,
    getExchangeRate,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
