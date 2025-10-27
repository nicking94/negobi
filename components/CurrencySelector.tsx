// components/CurrencySelector.tsx
"use client";
import { useCurrency } from "@/context/CurrencyContext";

export const CurrencySelector = () => {
  const { currency, setCurrency, availableCurrencies, isLoading } =
    useCurrency();

  return (
    <div className="flex bg-gray_xxl rounded-lg p-1 shadow-inner gap-1">
      {availableCurrencies.map((curr) => (
        <button
          key={curr.code}
          onClick={() => setCurrency(curr.code)}
          disabled={isLoading}
          className={`px-2 md:px-3 lg:px-4 py-1 md:py-2 text-xs font-medium rounded-md shadow-sm transition-all duration-300 ${
            currency.code === curr.code
              ? "bg-gradient-to-r from-green_m to-green_b text-white"
              : "bg-white hover:bg-gray_xxl text-gray_m hover:shadow-sm"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {curr.code}
          {isLoading && currency.code === curr.code && (
            <span className="ml-1">⟳</span>
          )}
        </button>
      ))}
    </div>
  );
};
