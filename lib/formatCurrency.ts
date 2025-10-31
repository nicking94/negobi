// utils/formatCurrency.ts
import { useCurrency } from "@/context/CurrencyContext";

export const useFormatCurrency = () => {
  const { formatPrice } = useCurrency();
  return formatPrice;
};

export const formatCurrency = (
  value: number,
  currency: string = "VES",
  exchangeRate: number = 36.5
) => {
  const convertedValue = currency === "USD" ? value / exchangeRate : value;

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(convertedValue);
};
