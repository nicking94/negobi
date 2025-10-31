// hooks/useCurrencyFormatter.ts
import { useCurrency } from "@/context/CurrencyContext";

export const useCurrencyFormatter = () => {
  const { formatPrice, convertPrice, currency } = useCurrency();

  const formatForTable = (price: number) => formatPrice(price);

  const formatForSummary = (price: number) => {
    const convertedPrice = convertPrice(price);

    if (currency.code === "VES") {
      return new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice);
    }

    if (currency.code === "USD") {
      return `$${new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice)}`;
    }

    return formatPrice(price, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatCompact = (price: number) => {
    const converted = convertPrice(price);

    if (currency.code === "VES") {
      if (converted >= 1000000) {
        return `${(converted / 1000000).toFixed(1)}M`;
      }
      if (converted >= 1000) {
        return `${(converted / 1000).toFixed(1)}K`;
      }
      return converted.toFixed(0);
    }

    if (currency.code === "USD") {
      if (converted >= 1000000) {
        return `$${(converted / 1000000).toFixed(1)}M`;
      }
      if (converted >= 1000) {
        return `$${(converted / 1000).toFixed(1)}K`;
      }
      return `$${converted.toFixed(0)}`;
    }

    if (converted >= 1000000) {
      return `${currency.symbol} ${(converted / 1000000).toFixed(1)}M`;
    }
    if (converted >= 1000) {
      return `${currency.symbol} ${(converted / 1000).toFixed(1)}K`;
    }
    return formatPrice(price);
  };

  const getNumericValue = (price: number) => convertPrice(price);

  return {
    formatPrice,
    formatForTable,
    formatForSummary,
    formatCompact,
    getNumericValue,
    convertPrice,
    currentCurrency: currency.code,
  };
};
