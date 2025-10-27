// hooks/useCurrencyFormatter.ts
import { useCurrency } from "@/context/CurrencyContext";

export const useCurrencyFormatter = () => {
  const { formatPrice, convertPrice, currency } = useCurrency();

  // Formateador para tablas
  const formatForTable = (price: number) => formatPrice(price);

  // Formateador para resúmenes/totales
  const formatForSummary = (price: number) => {
    const convertedPrice = convertPrice(price);

    // Para VES: sin símbolo, formato compacto para resúmenes
    if (currency.code === "VES") {
      return new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice);
    }

    // Para USD: símbolo $ con formato compacto
    if (currency.code === "USD") {
      return `$${new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice)}`;
    }

    // Para otras monedas
    return formatPrice(price, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Formateador compacto
  const formatCompact = (price: number) => {
    const converted = convertPrice(price);

    // Para VES: sin símbolo, formato compacto
    if (currency.code === "VES") {
      if (converted >= 1000000) {
        return `${(converted / 1000000).toFixed(1)}M`;
      }
      if (converted >= 1000) {
        return `${(converted / 1000).toFixed(1)}K`;
      }
      return converted.toFixed(0);
    }

    // Para USD: símbolo $ con formato compacto
    if (currency.code === "USD") {
      if (converted >= 1000000) {
        return `$${(converted / 1000000).toFixed(1)}M`;
      }
      if (converted >= 1000) {
        return `$${(converted / 1000).toFixed(1)}K`;
      }
      return `$${converted.toFixed(0)}`;
    }

    // Para otras monedas
    if (converted >= 1000000) {
      return `${currency.symbol} ${(converted / 1000000).toFixed(1)}M`;
    }
    if (converted >= 1000) {
      return `${currency.symbol} ${(converted / 1000).toFixed(1)}K`;
    }
    return formatPrice(price);
  };

  // Para inputs/forms - solo conversión sin formato
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
