import { useState, useEffect } from "react";
import {
  itemLotService,
  ItemLot,
  CreateItemLotData,
  UpdateItemLotData,
  GetItemLotsParams,
} from "../../services/itemLots/itemLots.service";

export interface UseItemLotsFilters {
  itemId?: number;
  productLotId?: number;
  quantity?: number;
  search?: string;
}

export const useItemLots = (filters: UseItemLotsFilters = {}) => {
  const [itemLots, setItemLots] = useState<ItemLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItemLots = async (customFilters?: Partial<UseItemLotsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetItemLotsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const itemLotsData = await itemLotService.getItemLots(combinedFilters);

      if (Array.isArray(itemLotsData)) {
        setItemLots(itemLotsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", itemLotsData);
        setItemLots([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar lotes de items"
      );
      setItemLots([]);
    } finally {
      setLoading(false);
    }
  };

  const createItemLot = async (
    itemLotData: CreateItemLotData
  ): Promise<ItemLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const newItemLot = await itemLotService.createItemLot(itemLotData);
      setItemLots((prev) => [...prev, newItemLot]);
      return newItemLot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear lote de item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItemLot = async (
    id: string,
    updates: UpdateItemLotData
  ): Promise<ItemLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedItemLot = await itemLotService.updateItemLot(id, updates);
      setItemLots((prev) =>
        prev.map((itemLot) =>
          itemLot.id.toString() === id ? updatedItemLot : itemLot
        )
      );
      return updatedItemLot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar lote de item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItemLot = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await itemLotService.deleteItemLot(id);
      setItemLots((prev) =>
        prev.filter((itemLot) => itemLot.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar lote de item"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getItemLotById = async (id: string): Promise<ItemLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const itemLot = await itemLotService.getItemLotById(id);
      return itemLot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener lote de item"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMultipleItemLots = async (
    itemLotsData: CreateItemLotData[]
  ): Promise<ItemLot[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdItemLots = await itemLotService.createMultipleItemLots(
        itemLotsData
      );
      setItemLots((prev) => [...prev, ...createdItemLots]);
      return createdItemLots;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples lotes de items"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItemLotQuantity = async (
    id: string,
    newQuantity: number
  ): Promise<ItemLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedItemLot = await itemLotService.updateItemLotQuantity(
        id,
        newQuantity
      );
      setItemLots((prev) =>
        prev.map((itemLot) =>
          itemLot.id.toString() === id ? updatedItemLot : itemLot
        )
      );
      return updatedItemLot;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar cantidad de lote"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const adjustItemLotQuantity = async (
    id: string,
    adjustment: number
  ): Promise<ItemLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedItemLot = await itemLotService.adjustItemLotQuantity(
        id,
        adjustment
      );
      if (updatedItemLot) {
        setItemLots((prev) =>
          prev.map((itemLot) =>
            itemLot.id.toString() === id ? updatedItemLot : itemLot
          )
        );
      }
      return updatedItemLot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al ajustar cantidad de lote"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItemLots();
  }, [filters.itemId, filters.productLotId, filters.quantity, filters.search]);

  return {
    itemLots,
    loading,
    error,
    createItemLot,
    updateItemLot,
    deleteItemLot,
    getItemLotById,
    createMultipleItemLots,
    updateItemLotQuantity,
    adjustItemLotQuantity,
    refetch: loadItemLots,
  };
};

export const useItemLotsByItem = (itemId?: number) => {
  const [itemLots, setItemLots] = useState<ItemLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItemLotsByItem = async (id?: number) => {
    const targetItemId = id || itemId;
    if (!targetItemId) {
      setError("itemId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const lots = await itemLotService.getItemLotsByItem(targetItemId);
      setItemLots(lots);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar lotes del item"
      );
      setItemLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      loadItemLotsByItem();
    }
  }, [itemId]);

  return {
    itemLots,
    loading,
    error,
    refetch: loadItemLotsByItem,
  };
};

export const useItemLotsByProductLot = (productLotId?: number) => {
  const [itemLots, setItemLots] = useState<ItemLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItemLotsByProductLot = async (id?: number) => {
    const targetProductLotId = id || productLotId;
    if (!targetProductLotId) {
      setError("productLotId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const lots = await itemLotService.getItemLotsByProductLot(
        targetProductLotId
      );
      setItemLots(lots);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items del lote de producto"
      );
      setItemLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productLotId) {
      loadItemLotsByProductLot();
    }
  }, [productLotId]);

  return {
    itemLots,
    loading,
    error,
    refetch: loadItemLotsByProductLot,
  };
};

export const useItemLotInventory = (itemId?: number) => {
  const {
    itemLots,
    loading,
    error,
    refetch,
    createItemLot,
    updateItemLot,
    deleteItemLot,
    adjustItemLotQuantity,
  } = useItemLots({ itemId });

  const totalInventory = itemLots.reduce(
    (total, itemLot) => total + itemLot.quantity,
    0
  );

  const addLot = async (productLotId: number, quantity: number) => {
    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    const itemLotData: CreateItemLotData = {
      itemId,
      productLotId,
      quantity,
    };

    return await createItemLot(itemLotData);
  };

  const updateLotQuantity = async (itemLotId: string, newQuantity: number) => {
    return await updateItemLot(itemLotId, { quantity: newQuantity });
  };

  const adjustLotQuantity = async (itemLotId: string, adjustment: number) => {
    return await adjustItemLotQuantity(itemLotId, adjustment);
  };

  const removeLot = async (itemLotId: string) => {
    return await deleteItemLot(itemLotId);
  };

  const getLotByProductLot = (productLotId: number): ItemLot | undefined => {
    return itemLots.find((lot) => lot.productLotId === productLotId);
  };

  const hasLotForProductLot = (productLotId: number): boolean => {
    return itemLots.some((lot) => lot.productLotId === productLotId);
  };

  const getQuantityByProductLot = (productLotId: number): number => {
    const lot = getLotByProductLot(productLotId);
    return lot ? lot.quantity : 0;
  };

  return {
    itemLots,
    totalInventory,
    loading,
    error,
    addLot,
    updateLotQuantity,
    adjustLotQuantity,
    removeLot,
    getLotByProductLot,
    hasLotForProductLot,
    getQuantityByProductLot,
    refetch,
  };
};

export const useInventoryCalculations = (itemId?: number) => {
  const { itemLots, loading, error } = useItemLotsByItem(itemId);

  const calculations = {
    totalQuantity: itemLots.reduce((total, lot) => total + lot.quantity, 0),
    totalLots: itemLots.length,
    maxQuantityLot: itemLots.reduce(
      (max, lot) => (lot.quantity > (max?.quantity || 0) ? lot : max),
      null as ItemLot | null
    ),

    minQuantityLot: itemLots.reduce(
      (min, lot) => (!min || lot.quantity < min.quantity ? lot : min),
      null as ItemLot | null
    ),

    averageQuantity:
      itemLots.length > 0
        ? itemLots.reduce((total, lot) => total + lot.quantity, 0) /
          itemLots.length
        : 0,

    lowQuantityLots: itemLots.filter((lot) => lot.quantity < 10),

    zeroQuantityLots: itemLots.filter((lot) => lot.quantity === 0),
  };

  return {
    calculations,
    itemLots,
    loading,
    error,
  };
};

export const useLotTransfers = (itemId?: number) => {
  const { itemLots, loading, error, refetch, adjustItemLotQuantity } =
    useItemLots({ itemId });

  const transferBetweenLots = async (
    fromItemLotId: string,
    toItemLotId: string,
    quantity: number
  ): Promise<boolean> => {
    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    try {
      const fromResult = await adjustItemLotQuantity(fromItemLotId, -quantity);
      if (!fromResult) {
        throw new Error("Error al restar del lote origen");
      }

      const toResult = await adjustItemLotQuantity(toItemLotId, quantity);
      if (!toResult) {
        await adjustItemLotQuantity(fromItemLotId, quantity);
        throw new Error("Error al sumar al lote destino");
      }

      return true;
    } catch (error) {
      console.error("Error transferring between lots:", error);
      return false;
    }
  };

  const consolidateLots = async (
    targetItemLotId: string,
    sourceItemLotIds: string[]
  ): Promise<boolean> => {
    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    try {
      let totalTransfer = 0;

      for (const sourceId of sourceItemLotIds) {
        const sourceLot = itemLots.find(
          (lot) => lot.id.toString() === sourceId
        );
        if (sourceLot && sourceLot.id.toString() !== targetItemLotId) {
          totalTransfer += sourceLot.quantity;
        }
      }

      for (const sourceId of sourceItemLotIds) {
        if (sourceId !== targetItemLotId) {
          const sourceLot = itemLots.find(
            (lot) => lot.id.toString() === sourceId
          );
          if (sourceLot) {
            await adjustItemLotQuantity(sourceId, -sourceLot.quantity);
          }
        }
      }

      await adjustItemLotQuantity(targetItemLotId, totalTransfer);

      return true;
    } catch (error) {
      console.error("Error consolidating lots:", error);
      return false;
    }
  };

  return {
    itemLots,
    loading,
    error,
    transferBetweenLots,
    consolidateLots,
    refetch,
  };
};
