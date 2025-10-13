import { useState, useEffect } from "react";
import {
  itemTaxService,
  ItemTax,
  CreateItemTaxData,
  UpdateItemTaxData,
  GetItemTaxesParams,
} from "../../services/itemTaxes/itemTaxes.service";

// Definir el tipo para los filtros del hook
export interface UseItemTaxesFilters {
  itemId?: number;
  taxTypeId?: number;
  tax_rate?: number;
  tax_amount?: number;
  search?: string;
}

export const useItemTaxes = (filters: UseItemTaxesFilters = {}) => {
  const [itemTaxes, setItemTaxes] = useState<ItemTax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los impuestos de items con filtros
  const loadItemTaxes = async (
    customFilters?: Partial<UseItemTaxesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetItemTaxesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log(
        "🔵 Enviando parámetros para impuestos de items:",
        combinedFilters
      );

      const itemTaxesData = await itemTaxService.getItemTaxes(combinedFilters);
      console.log("🟢 Datos de impuestos de items recibidos:", itemTaxesData);

      if (Array.isArray(itemTaxesData)) {
        setItemTaxes(itemTaxesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", itemTaxesData);
        setItemTaxes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar impuestos de items"
      );
      setItemTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear impuesto de item
  const createItemTax = async (
    itemTaxData: CreateItemTaxData
  ): Promise<ItemTax | null> => {
    try {
      setLoading(true);
      setError(null);
      const newItemTax = await itemTaxService.createItemTax(itemTaxData);
      setItemTaxes((prev) => [...prev, newItemTax]);
      return newItemTax;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear impuesto de item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar impuesto de item
  const updateItemTax = async (
    id: string,
    updates: UpdateItemTaxData
  ): Promise<ItemTax | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedItemTax = await itemTaxService.updateItemTax(id, updates);
      setItemTaxes((prev) =>
        prev.map((itemTax) =>
          itemTax.id.toString() === id ? updatedItemTax : itemTax
        )
      );
      return updatedItemTax;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar impuesto de item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar impuesto de item
  const deleteItemTax = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await itemTaxService.deleteItemTax(id);
      setItemTaxes((prev) =>
        prev.filter((itemTax) => itemTax.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar impuesto de item"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener impuesto de item por ID
  const getItemTaxById = async (id: string): Promise<ItemTax | null> => {
    try {
      setLoading(true);
      setError(null);
      const itemTax = await itemTaxService.getItemTaxById(id);
      return itemTax;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener impuesto de item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear múltiples impuestos de items
  const createMultipleItemTaxes = async (
    itemTaxesData: CreateItemTaxData[]
  ): Promise<ItemTax[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdItemTaxes = await itemTaxService.createMultipleItemTaxes(
        itemTaxesData
      );
      setItemTaxes((prev) => [...prev, ...createdItemTaxes]);
      return createdItemTaxes;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples impuestos de items"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar o crear impuestos en lote
  const upsertItemTaxes = async (
    itemId: number,
    taxes: { taxTypeId: number; tax_rate: number; tax_amount: number }[]
  ): Promise<ItemTax[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const results = await itemTaxService.upsertItemTaxes(itemId, taxes);

      // Actualizar el estado local
      const updatedItemTaxes = [...itemTaxes];

      results.forEach((result) => {
        const existingIndex = updatedItemTaxes.findIndex(
          (tax) => tax.id === result.id
        );

        if (existingIndex >= 0) {
          updatedItemTaxes[existingIndex] = result;
        } else {
          updatedItemTaxes.push(result);
        }
      });

      setItemTaxes(updatedItemTaxes);
      return results;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar/crear impuestos de items"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calcular impuestos para un item
  const calculateItemTaxes = async (
    itemId: number,
    baseAmount: number,
    taxTypeIds: number[]
  ): Promise<
    { taxTypeId: number; tax_rate: number; tax_amount: number }[] | null
  > => {
    try {
      setLoading(true);
      setError(null);
      const calculatedTaxes = await itemTaxService.calculateItemTaxes(
        itemId,
        baseAmount,
        taxTypeIds
      );
      return calculatedTaxes;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al calcular impuestos del item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar impuestos de items al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadItemTaxes();
  }, [
    filters.itemId,
    filters.taxTypeId,
    filters.tax_rate,
    filters.tax_amount,
    filters.search,
  ]);

  return {
    itemTaxes,
    loading,
    error,
    createItemTax,
    updateItemTax,
    deleteItemTax,
    getItemTaxById,
    createMultipleItemTaxes,
    upsertItemTaxes,
    calculateItemTaxes,
    refetch: loadItemTaxes,
  };
};

// Hook especializado para impuestos de un item específico
export const useItemTaxesByItem = (itemId?: number) => {
  const [itemTaxes, setItemTaxes] = useState<ItemTax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItemTaxesByItem = async (id?: number) => {
    const targetItemId = id || itemId;
    if (!targetItemId) {
      setError("itemId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const taxes = await itemTaxService.getItemTaxesByItem(targetItemId);
      setItemTaxes(taxes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar impuestos del item"
      );
      setItemTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      loadItemTaxesByItem();
    }
  }, [itemId]);

  return {
    itemTaxes,
    loading,
    error,
    refetch: loadItemTaxesByItem,
  };
};

// Hook especializado para items de un tipo de impuesto específico
export const useItemTaxesByTaxType = (taxTypeId?: number) => {
  const [itemTaxes, setItemTaxes] = useState<ItemTax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItemTaxesByTaxType = async (id?: number) => {
    const targetTaxTypeId = id || taxTypeId;
    if (!targetTaxTypeId) {
      setError("taxTypeId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const taxes = await itemTaxService.getItemTaxesByTaxType(targetTaxTypeId);
      setItemTaxes(taxes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items del tipo de impuesto"
      );
      setItemTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taxTypeId) {
      loadItemTaxesByTaxType();
    }
  }, [taxTypeId]);

  return {
    itemTaxes,
    loading,
    error,
    refetch: loadItemTaxesByTaxType,
  };
};

// Hook para gestión de impuestos de item (para formularios)
export const useItemTaxManager = (itemId?: number) => {
  const {
    itemTaxes,
    loading,
    error,
    refetch,
    createItemTax,
    updateItemTax,
    deleteItemTax,
    upsertItemTaxes,
  } = useItemTaxes(itemId ? { itemId } : {});

  // Agregar impuesto al item
  const addTax = async (
    taxTypeId: number,
    tax_rate: number,
    tax_amount: number
  ) => {
    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    const itemTaxData: CreateItemTaxData = {
      itemId,
      taxTypeId,
      tax_rate,
      tax_amount,
    };

    return await createItemTax(itemTaxData);
  };

  // Actualizar impuesto del item
  const updateTax = async (itemTaxId: string, updates: UpdateItemTaxData) => {
    return await updateItemTax(itemTaxId, updates);
  };

  // Remover impuesto del item
  const removeTax = async (itemTaxId: string) => {
    return await deleteItemTax(itemTaxId);
  };

  // Reemplazar todos los impuestos del item
  const replaceAllTaxes = async (
    taxes: { taxTypeId: number; tax_rate: number; tax_amount: number }[]
  ) => {
    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    return await upsertItemTaxes(itemId, taxes);
  };

  // Obtener impuesto por tipo de impuesto
  const getTaxByType = (taxTypeId: number): ItemTax | undefined => {
    return itemTaxes.find((tax) => tax.taxTypeId === taxTypeId);
  };

  // Verificar si el item tiene un tipo de impuesto específico
  const hasTaxType = (taxTypeId: number): boolean => {
    return itemTaxes.some((tax) => tax.taxTypeId === taxTypeId);
  };

  // Calcular total de impuestos
  const getTotalTaxAmount = (): number => {
    return itemTaxes.reduce((total, tax) => total + tax.tax_amount, 0);
  };

  // Calcular tasa total de impuestos
  const getTotalTaxRate = (): number => {
    return itemTaxes.reduce((total, tax) => total + tax.tax_rate, 0);
  };

  return {
    itemTaxes,
    loading,
    error,
    addTax,
    updateTax,
    removeTax,
    replaceAllTaxes,
    getTaxByType,
    hasTaxType,
    getTotalTaxAmount,
    getTotalTaxRate,
    refetch,
  };
};

// Hook para cálculo de impuestos en tiempo real
export const useItemTaxCalculator = (itemId?: number) => {
  const { itemTaxes, loading, error } = useItemTaxesByItem(itemId);

  const calculateTaxesForAmount = (
    baseAmount: number
  ): {
    taxTypeId: number;
    tax_rate: number;
    tax_amount: number;
    calculated_amount: number;
  }[] => {
    if (!itemTaxes.length) return [];

    return itemTaxes.map((tax) => {
      // Si ya tiene un tax_amount definido, usarlo
      // De lo contrario, calcular basado en la tasa
      const calculated_amount =
        tax.tax_amount > 0 ? tax.tax_amount : baseAmount * (tax.tax_rate / 100);

      return {
        taxTypeId: tax.taxTypeId!,
        tax_rate: tax.tax_rate,
        tax_amount: tax.tax_amount,
        calculated_amount,
      };
    });
  };

  const calculateTotalWithTaxes = (baseAmount: number): number => {
    const taxes = calculateTaxesForAmount(baseAmount);
    return taxes.reduce(
      (total, tax) => total + tax.calculated_amount,
      baseAmount
    );
  };

  const getTotalTaxAmountForBase = (baseAmount: number): number => {
    const taxes = calculateTaxesForAmount(baseAmount);
    return taxes.reduce((total, tax) => total + tax.calculated_amount, 0);
  };

  return {
    calculateTaxesForAmount,
    calculateTotalWithTaxes,
    getTotalTaxAmountForBase,
    itemTaxes,
    loading,
    error,
  };
};
