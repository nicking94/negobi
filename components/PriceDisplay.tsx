// components/PriceDisplay.tsx
import { useCurrencyFormatter } from "@/hooks/currencies/useCurrencyFormatter";

interface PriceDisplayProps {
  value: number;
  variant?: "default" | "table" | "summary" | "compact";
  className?: string;
  originalCurrency?: string;
  showCurrencyCode?: boolean;
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
