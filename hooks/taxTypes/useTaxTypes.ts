import { useState, useEffect, useMemo } from "react";
import {
  taxTypeService,
  TaxType,
  CreateTaxTypeData,
  UpdateTaxTypeData,
  AppliesTo,
  GetTaxTypesParams,
  SyncTaxTypesPayload,
  SyncResponse,
} from "../../services/taxTypes/tayTypes.service";

export interface UseTaxTypesFilters {
  search?: string;
  tax_name?: string;
  tax_code?: string;
  applies_to?: string;
  is_active?: boolean;
}

export const useTaxTypes = (filters: UseTaxTypesFilters = {}) => {
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTaxTypes = async (customFilters?: Partial<UseTaxTypesFilters>) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetTaxTypesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const taxTypesData = await taxTypeService.getTaxTypes(combinedFilters);

      if (Array.isArray(taxTypesData)) {
        setTaxTypes(taxTypesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", taxTypesData);
        setTaxTypes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar tipos de impuesto"
      );
      setTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const createTaxType = async (
    taxTypeData: CreateTaxTypeData
  ): Promise<TaxType | null> => {
    try {
      setLoading(true);
      setError(null);
      const newTaxType = await taxTypeService.createTaxType(taxTypeData);
      setTaxTypes((prev) => [...prev, newTaxType]);
      return newTaxType;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear tipo de impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTaxType = async (
    id: string,
    updates: UpdateTaxTypeData
  ): Promise<TaxType | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedTaxType = await taxTypeService.updateTaxType(id, updates);
      setTaxTypes((prev) =>
        prev.map((taxType) =>
          taxType.id.toString() === id ? updatedTaxType : taxType
        )
      );
      return updatedTaxType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar tipo de impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTaxType = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await taxTypeService.deleteTaxType(id);
      setTaxTypes((prev) =>
        prev.filter((taxType) => taxType.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar tipo de impuesto"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTaxTypeById = async (id: string): Promise<TaxType | null> => {
    try {
      setLoading(true);
      setError(null);
      const taxType = await taxTypeService.getTaxTypeById(id);
      return taxType;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener tipo de impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncTaxTypes = async (
    syncData: SyncTaxTypesPayload
  ): Promise<SyncResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await taxTypeService.syncTaxTypes(syncData);

      await loadTaxTypes();
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al sincronizar tipos de impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateTax = (amount: number, taxTypeId: string): number => {
    const taxType = taxTypes.find((t) => t.id.toString() === taxTypeId);
    if (!taxType) return 0;

    return taxTypeService.calculateTax(amount, taxType);
  };

  useEffect(() => {
    loadTaxTypes();
  }, [
    filters.search,
    filters.tax_name,
    filters.tax_code,
    filters.applies_to,
    filters.is_active,
  ]);

  return {
    taxTypes,
    loading,
    error,
    createTaxType,
    updateTaxType,
    deleteTaxType,
    getTaxTypeById,
    syncTaxTypes,
    calculateTax,
    refetch: loadTaxTypes,
  };
};

export const useActiveTaxTypes = () => {
  const [activeTaxTypes, setActiveTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveTaxTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const taxTypes = await taxTypeService.getActiveTaxTypes();
      setActiveTaxTypes(taxTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de impuesto activos"
      );
      setActiveTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveTaxTypes();
  }, []);

  return {
    activeTaxTypes,
    loading,
    error,
    refetch: loadActiveTaxTypes,
  };
};

export const useSalesTaxTypes = () => {
  const [salesTaxTypes, setSalesTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSalesTaxTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const taxTypes = await taxTypeService.getSalesTaxTypes();
      setSalesTaxTypes(taxTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar impuestos de venta"
      );
      setSalesTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesTaxTypes();
  }, []);

  return {
    salesTaxTypes,
    loading,
    error,
    refetch: loadSalesTaxTypes,
  };
};

export const usePurchaseTaxTypes = () => {
  const [purchaseTaxTypes, setPurchaseTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPurchaseTaxTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const taxTypes = await taxTypeService.getPurchaseTaxTypes();
      setPurchaseTaxTypes(taxTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar impuestos de compra"
      );
      setPurchaseTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseTaxTypes();
  }, []);

  return {
    purchaseTaxTypes,
    loading,
    error,
    refetch: loadPurchaseTaxTypes,
  };
};

export const useTaxTypeOptions = (appliesTo?: AppliesTo) => {
  const {
    taxTypes: allTaxTypes,
    loading,
    error,
    refetch,
  } = useTaxTypes({
    is_active: true,
  });

  const filteredTaxTypes = useMemo(() => {
    if (!appliesTo) return allTaxTypes;

    return allTaxTypes.filter((taxType) => {
      if (appliesTo === "Sales") {
        return taxType.applies_to_sales;
      } else if (appliesTo === "Purchases") {
        return taxType.applies_to_purchase;
      }
      return true;
    });
  }, [allTaxTypes, appliesTo]);

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

export const useTaxCalculator = () => {
  const { activeTaxTypes } = useActiveTaxTypes();

  const calculateTaxes = (
    amount: number,
    taxTypeIds: string[]
  ): {
    taxType: TaxType;
    taxAmount: number;
    totalWithTax: number;
  }[] => {
    return taxTypeIds
      .map((taxTypeId) => {
        const taxType = activeTaxTypes.find(
          (t) => t.id.toString() === taxTypeId
        );
        if (!taxType) return null;

        const taxAmount = taxTypeService.calculateTax(amount, taxType);
        const totalWithTax = amount + taxAmount;

        return {
          taxType,
          taxAmount,
          totalWithTax,
        };
      })
      .filter(Boolean) as {
      taxType: TaxType;
      taxAmount: number;
      totalWithTax: number;
    }[];
  };

  const calculateTotalWithTaxes = (
    amount: number,
    taxTypeIds: string[]
  ): number => {
    const taxes = calculateTaxes(amount, taxTypeIds);
    return taxes.reduce((total, tax) => total + tax.taxAmount, amount);
  };

  return {
    calculateTaxes,
    calculateTotalWithTaxes,
    activeTaxTypes,
  };
};
