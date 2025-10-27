// components/PriceDisplay.tsx
import { useCurrencyFormatter } from "@/hooks/currencies/useCurrencyFormatter";

interface PriceDisplayProps {
  value: number;
  variant?: "default" | "table" | "summary" | "compact";
  className?: string;
  originalCurrency?: string; // Si el precio viene en otra moneda
  showCurrencyCode?: boolean; // Nueva prop para mostrar código de moneda
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  value,
  variant = "default",
  className = "",
  originalCurrency,
  showCurrencyCode = false,
}) => {
  const {
    formatPrice,
    formatForTable,
    formatForSummary,
    formatCompact,
    convertPrice,
    currentCurrency,
  } = useCurrencyFormatter();

  // Si se especifica una moneda original, convertir primero
  const displayValue = originalCurrency
    ? convertPrice(value, originalCurrency)
    : value;

  const getFormattedValue = () => {
    switch (variant) {
      case "table":
        return formatForTable(displayValue);
      case "summary":
        return formatForSummary(displayValue);
      case "compact":
        return formatCompact(displayValue);
      default:
        return formatPrice(displayValue);
    }
  };

  // Agregar código de moneda si se solicita (útil para VES)
  const getDisplayContent = () => {
    const formattedValue = getFormattedValue();

    if (showCurrencyCode && currentCurrency === "VES") {
      return `${formattedValue} VES`;
    }

    return formattedValue;
  };

  return (
    <span className={`font-medium ${className}`}>{getDisplayContent()}</span>
  );
};
