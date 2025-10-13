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

// Definir el tipo para los filtros del hook
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

  // Cargar todos los tipos de impuestos con filtros
  const loadTaxTypes = async (customFilters?: Partial<UseTaxTypesFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetTaxTypesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log(
        "🔵 Enviando parámetros para tipos de impuesto:",
        combinedFilters
      );

      const taxTypesData = await taxTypeService.getTaxTypes(combinedFilters);
      console.log("🟢 Datos de tipos de impuesto recibidos:", taxTypesData);

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

  // Crear tipo de impuesto
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

  // Actualizar tipo de impuesto
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

  // Eliminar tipo de impuesto
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

  // Obtener tipo de impuesto por ID
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

  // Sincronizar tipos de impuesto desde ERP
  const syncTaxTypes = async (
    syncData: SyncTaxTypesPayload
  ): Promise<SyncResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await taxTypeService.syncTaxTypes(syncData);
      // Recargar tipos de impuesto después de sincronizar
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

  // Calcular impuesto
  const calculateTax = (amount: number, taxTypeId: string): number => {
    const taxType = taxTypes.find((t) => t.id.toString() === taxTypeId);
    if (!taxType) return 0;

    return taxTypeService.calculateTax(amount, taxType);
  };

  // Cargar tipos de impuesto al montar el hook o cuando cambien los filtros
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

// Hook especializado para tipos de impuesto activos
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

// Hook especializado para impuestos de venta
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

// Hook especializado para impuestos de compra
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

// Hook para opciones de tipos de impuesto (para dropdowns) - VERSIÓN CORREGIDA
export const useTaxTypeOptions = (appliesTo?: AppliesTo) => {
  // Usar el hook base con filtro de activos y aplicar filtros adicionales
  const {
    taxTypes: allTaxTypes,
    loading,
    error,
    refetch,
  } = useTaxTypes({
    is_active: true,
  });

  // Filtrar los taxTypes según el parámetro appliesTo
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

// Hook para cálculo de impuestos
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
