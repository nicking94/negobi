import { useMemo } from "react";
import { useActiveTaxTypes } from "./useTaxTypes";
import { AppliesTo } from "@/services/taxTypes/tayTypes.service";

export const useTaxTypeOptions = (appliesTo?: AppliesTo) => {
  const { activeTaxTypes, loading, error, refetch } = useActiveTaxTypes();

  const filteredTaxTypes = useMemo(() => {
    if (!appliesTo) return activeTaxTypes;

    return activeTaxTypes.filter((taxType) => {
      if (appliesTo === "Sales") {
        return taxType.applies_to_sales;
      } else if (appliesTo === "Purchases") {
        return taxType.applies_to_purchase;
      }
      return true;
    });
  }, [activeTaxTypes, appliesTo]);

  const taxTypeOptions = useMemo(() => {
    return filteredTaxTypes.map((taxType) => ({
      value: taxType.id,
      label: `${taxType.tax_name} (${taxType.tax_code}) - ${
        taxType.default_rate
      }${taxType.is_percentage ? "%" : ""}`,
      tax_name: taxType.tax_name,
      tax_code: taxType.tax_code,
      default_rate: taxType.default_rate,
      is_percentage: taxType.is_percentage,
      applies_to_sales: taxType.applies_to_sales,
      applies_to_purchase: taxType.applies_to_purchase,
    }));
  }, [filteredTaxTypes]);

  return {
    taxTypeOptions,
    taxTypes: filteredTaxTypes,
    loading,
    error,
    refetch,
  };
};
