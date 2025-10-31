import { useState, useEffect } from "react";
import {
  itemTaxService,
  ItemTax,
  CreateItemTaxData,
  UpdateItemTaxData,
  GetItemTaxesParams,
} from "../../services/itemTaxes/itemTaxes.service";

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

  const loadItemTaxes = async (
    customFilters?: Partial<UseItemTaxesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetItemTaxesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const itemTaxesData = await itemTaxService.getItemTaxes(combinedFilters);

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

  const upsertItemTaxes = async (
    itemId: number,
    taxes: { taxTypeId: number; tax_rate: number; tax_amount: number }[]
  ): Promise<ItemTax[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const results = await itemTaxService.upsertItemTaxes(itemId, taxes);

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

  const updateTax = async (itemTaxId: string, updates: UpdateItemTaxData) => {
    return await updateItemTax(itemTaxId, updates);
  };

  const removeTax = async (itemTaxId: string) => {
    return await deleteItemTax(itemTaxId);
  };

  const replaceAllTaxes = async (
    taxes: { taxTypeId: number; tax_rate: number; tax_amount: number }[]
  ) => {
    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    return await upsertItemTaxes(itemId, taxes);
  };

  const getTaxByType = (taxTypeId: number): ItemTax | undefined => {
    return itemTaxes.find((tax) => tax.taxTypeId === taxTypeId);
  };

  const hasTaxType = (taxTypeId: number): boolean => {
    return itemTaxes.some((tax) => tax.taxTypeId === taxTypeId);
  };

  const getTotalTaxAmount = (): number => {
    return itemTaxes.reduce((total, tax) => total + tax.tax_amount, 0);
  };

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
