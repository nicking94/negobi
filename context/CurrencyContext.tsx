// context/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRate: number;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

// Tasa de cambio (deberías obtener esto de una API)
const DEFAULT_EXCHANGE_RATE = 36.5; // Ejemplo: 1 USD = 36.5 VES

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<string>("VES");
  const [exchangeRate, setExchangeRate] = useState<number>(
    DEFAULT_EXCHANGE_RATE
  );

  // Obtener la tasa de cambio actualizada
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Aquí puedes llamar a tu API para obtener la tasa de cambio actual
        // const rate = await getExchangeRate();
        // setExchangeRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  const convertPrice = (price: number): number => {
    if (currency === "USD") {
      return price / exchangeRate;
    }
    return price; // Ya está en VES
  };

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);

    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(convertedPrice);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        formatPrice,
        convertPrice,
      }}
    >
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
