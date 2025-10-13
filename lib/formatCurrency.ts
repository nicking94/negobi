// utils/formatCurrency.ts
export const formatCurrency = (value: number, currency: string = "VES") => {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};
