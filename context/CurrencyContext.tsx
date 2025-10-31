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

const DEFAULT_CURRENCIES: Currency[] = [
  {
    code: "VES",
    name: "Bolívar Soberano",
    symbol: "$",
    decimalPlaces: 2,
    exchangeRate: 1,
  },
  {
    code: "USD",
    name: "Dólar Estadounidense",
    symbol: "$",
    decimalPlaces: 2,
    exchangeRate: 36.5,
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

  const fetchExchangeRates = useCallback(async () => {
    try {
      setIsLoading(true);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrency = useCallback(
    (currencyCode: string) => {
      const newCurrency = availableCurrencies.find(
        (c) => c.code === currencyCode
      );
      if (newCurrency) {
        setCurrentCurrency(newCurrency);

        localStorage.setItem("preferredCurrency", currencyCode);
      }
    },
    [availableCurrencies]
  );

  const convertPrice = useCallback(
    (price: number, fromCurrency: string = "VES"): number => {
      if (fromCurrency === currentCurrency.code) {
        return price;
      }

      const fromRate = getExchangeRate(fromCurrency);
      const toRate = currentCurrency.exchangeRate;

      const baseAmount = price / fromRate;
      return baseAmount * toRate;
    },
    [currentCurrency.code, availableCurrencies]
  );

  const getExchangeRate = useCallback(
    (currencyCode: string): number => {
      const currency = availableCurrencies.find((c) => c.code === currencyCode);
      return currency?.exchangeRate || 1;
    },
    [availableCurrencies]
  );

  const formatPrice = useCallback(
    (price: number, options?: Intl.NumberFormatOptions): string => {
      const convertedPrice = convertPrice(price);

      if (currentCurrency.code === "VES" || currentCurrency.code === "USD") {
        const formattedNumber = new Intl.NumberFormat("es-VE", {
          minimumFractionDigits: currentCurrency.decimalPlaces,
          maximumFractionDigits: currentCurrency.decimalPlaces,
          ...options,
        }).format(convertedPrice);

        return `$${formattedNumber}`;
      }

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
        return `${currentCurrency.symbol} ${convertedPrice.toFixed(
          currentCurrency.decimalPlaces
        )}`;
      }
    },
    [currentCurrency, convertPrice]
  );

  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    fetchExchangeRates();

    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
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
