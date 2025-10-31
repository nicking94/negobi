import { useState, useEffect } from "react";
import {
  stockByWarehouseService,
  StockByWarehouse,
  CreateStockByWarehouseData,
  UpdateStockByWarehouseData,
  GetStockByWarehouseParams,
  SyncStockByWarehouseData,
  StockAnalysis,
} from "../../services/stockByWarehouse/stockByWarehouse.service";

export interface UseStockByWarehouseFilters {
  warehouseId?: number;
  productId?: number;
  search?: string;
}

export const useStockByWarehouse = (
  filters: UseStockByWarehouseFilters = {}
) => {
  const [stocks, setStocks] = useState<StockByWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStocks = async (
    customFilters?: Partial<UseStockByWarehouseFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetStockByWarehouseParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const stocksData = await stockByWarehouseService.getStockByWarehouse(
        combinedFilters
      );

      if (Array.isArray(stocksData)) {
        setStocks(stocksData);
      } else {
        console.warn("⚠️ Estructura inesperada:", stocksData);
        setStocks([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar stock por almacén"
      );
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const createStockByWarehouse = async (
    stockData: CreateStockByWarehouseData
  ): Promise<StockByWarehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const newStock = await stockByWarehouseService.createStockByWarehouse(
        stockData
      );
      setStocks((prev) => [...prev, newStock]);
      return newStock;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear stock por almacén"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStockByWarehouse = async (
    id: string,
    updates: UpdateStockByWarehouseData
  ): Promise<StockByWarehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedStock = await stockByWarehouseService.updateStockByWarehouse(
        id,
        updates
      );
      setStocks((prev) =>
        prev.map((stock) => (stock.id.toString() === id ? updatedStock : stock))
      );
      return updatedStock;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar stock por almacén"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteStockByWarehouse = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await stockByWarehouseService.deleteStockByWarehouse(id);
      setStocks((prev) => prev.filter((stock) => stock.id.toString() !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar stock por almacén"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStockByWarehouseById = async (
    id: string
  ): Promise<StockByWarehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const stock = await stockByWarehouseService.getStockByWarehouseById(id);
      return stock;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener stock por almacén"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncStockByWarehouse = async (
    syncData: SyncStockByWarehouseData
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await stockByWarehouseService.syncStockByWarehouse(syncData);

      await loadStocks();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al sincronizar stock desde ERP"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStockByWarehouseAndProduct = async (
    warehouseId: number,
    productId: number
  ): Promise<StockByWarehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const stock = await stockByWarehouseService.getStockByWarehouseAndProduct(
        warehouseId,
        productId
      );
      return stock;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener stock por almacén y producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStockQuantity = async (
    id: string,
    newStock: number
  ): Promise<StockByWarehouse | null> => {
    try {
      return await updateStockByWarehouse(id, { stock: newStock });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar cantidad de stock"
      );
      return null;
    }
  };

  const adjustStockQuantity = async (
    id: string,
    adjustment: number
  ): Promise<StockByWarehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedStock = await stockByWarehouseService.adjustStockQuantity(
        id,
        adjustment
      );
      if (updatedStock) {
        setStocks((prev) =>
          prev.map((stock) =>
            stock.id.toString() === id ? updatedStock : stock
          )
        );
      }
      return updatedStock;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al ajustar cantidad de stock"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReserveStock = async (
    id: string,
    newReserveStock: number
  ): Promise<StockByWarehouse | null> => {
    try {
      return await updateStockByWarehouse(id, {
        reserve_stock: newReserveStock,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar stock de reserva"
      );
      return null;
    }
  };

  const updateIncomingStock = async (
    id: string,
    newIncomingStock: number
  ): Promise<StockByWarehouse | null> => {
    try {
      return await updateStockByWarehouse(id, {
        incoming_stock: newIncomingStock,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar stock entrante"
      );
      return null;
    }
  };

  const calculateAvailableStock = (stockRecord: StockByWarehouse): number => {
    return stockByWarehouseService.calculateAvailableStock(stockRecord);
  };

  const analyzeStockLevel = (stockRecord: StockByWarehouse): StockAnalysis => {
    return stockByWarehouseService.analyzeStockLevel(stockRecord);
  };

  const hasSufficientStock = (
    stockRecord: StockByWarehouse,
    requiredQuantity: number
  ): boolean => {
    return stockByWarehouseService.hasSufficientStock(
      stockRecord,
      requiredQuantity
    );
  };

  const transferStock = async (
    fromStockId: string,
    toStockId: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await stockByWarehouseService.transferStock(
        fromStockId,
        toStockId,
        quantity
      );
      if (success) {
        await loadStocks();
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al transferir stock"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, [filters.warehouseId, filters.productId, filters.search]);

  return {
    stocks,
    loading,
    error,
    createStockByWarehouse,
    updateStockByWarehouse,
    deleteStockByWarehouse,
    getStockByWarehouseById,
    syncStockByWarehouse,
    getStockByWarehouseAndProduct,
    updateStockQuantity,
    adjustStockQuantity,
    updateReserveStock,
    updateIncomingStock,
    calculateAvailableStock,
    analyzeStockLevel,
    hasSufficientStock,
    transferStock,
    refetch: loadStocks,
  };
};

export const useStockByWarehouseId = (warehouseId?: number) => {
  const [stocks, setStocks] = useState<StockByWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStocksByWarehouse = async (id?: number) => {
    const targetWarehouseId = id || warehouseId;
    if (!targetWarehouseId) {
      setError("warehouseId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const warehouseStocks = await stockByWarehouseService.getStockByWarehouse(
        {
          warehouseId: targetWarehouseId,
          itemsPerPage: 10,
        }
      );
      setStocks(warehouseStocks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar stock del almacén"
      );
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) {
      loadStocksByWarehouse();
    }
  }, [warehouseId]);

  return {
    stocks,
    loading,
    error,
    refetch: loadStocksByWarehouse,
  };
};

export const useStockByProductId = (productId?: number) => {
  const [stocks, setStocks] = useState<StockByWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStocksByProduct = async (id?: number) => {
    const targetProductId = id || productId;
    if (!targetProductId) {
      setError("productId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const productStocks = await stockByWarehouseService.getStockByProduct(
        targetProductId
      );
      setStocks(productStocks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar stock del producto"
      );
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadStocksByProduct();
    }
  }, [productId]);

  return {
    stocks,
    loading,
    error,
    refetch: loadStocksByProduct,
  };
};

export const useInventoryAnalysis = (warehouseId?: number) => {
  const { stocks, loading, error } = useStockByWarehouseId(warehouseId);

  const analysis = {
    totalItems: stocks.length,
    totalPhysicalStock: stocks.reduce((total, stock) => total + stock.stock, 0),
    totalReservedStock: stocks.reduce(
      (total, stock) => total + stock.reserve_stock,
      0
    ),
    totalIncomingStock: stocks.reduce(
      (total, stock) => total + stock.incoming_stock,
      0
    ),
    totalAvailableStock: stocks.reduce(
      (total, stock) =>
        total + stockByWarehouseService.calculateAvailableStock(stock),
      0
    ),

    outOfStockItems: stocks.filter((stock) => {
      const analysis = stockByWarehouseService.analyzeStockLevel(stock);
      return analysis.stock_level === "OUT_OF_STOCK";
    }).length,

    lowStockItems: stocks.filter((stock) => {
      const analysis = stockByWarehouseService.analyzeStockLevel(stock);
      return analysis.stock_level === "LOW";
    }).length,

    normalStockItems: stocks.filter((stock) => {
      const analysis = stockByWarehouseService.analyzeStockLevel(stock);
      return analysis.stock_level === "NORMAL";
    }).length,

    highStockItems: stocks.filter((stock) => {
      const analysis = stockByWarehouseService.analyzeStockLevel(stock);
      return analysis.stock_level === "HIGH";
    }).length,

    needsReplenishment: stocks.filter((stock) => {
      const analysis = stockByWarehouseService.analyzeStockLevel(stock);
      return analysis.needs_replenishment;
    }).length,

    estimatedTotalValue: stocks.reduce(
      (total, stock) => total + stock.stock,
      0
    ),
  };

  return {
    analysis,
    stocks,
    loading,
    error,
  };
};

export const useLowStockManagement = (warehouseId?: number) => {
  const [lowStockItems, setLowStockItems] = useState<StockByWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLowStockItems = async (id?: number) => {
    const targetWarehouseId = id || warehouseId;

    try {
      setLoading(true);
      setError(null);
      const lowStock = await stockByWarehouseService.getLowStockItems(
        targetWarehouseId
      );
      setLowStockItems(lowStock);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar productos con stock bajo"
      );
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLowStockItems();
  }, [warehouseId]);

  return {
    lowStockItems,
    loading,
    error,
    refetch: loadLowStockItems,
  };
};

export const useOutOfStockManagement = (warehouseId?: number) => {
  const [outOfStockItems, setOutOfStockItems] = useState<StockByWarehouse[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOutOfStockItems = async (id?: number) => {
    const targetWarehouseId = id || warehouseId;

    try {
      setLoading(true);
      setError(null);
      const outOfStock = await stockByWarehouseService.getOutOfStockItems(
        targetWarehouseId
      );
      setOutOfStockItems(outOfStock);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar productos agotados"
      );
      setOutOfStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutOfStockItems();
  }, [warehouseId]);

  return {
    outOfStockItems,
    loading,
    error,
    refetch: loadOutOfStockItems,
  };
};

export const useStockTransfers = () => {
  const { stocks, loading, error, refetch, transferStock } =
    useStockByWarehouse();

  const getAvailableWarehousesForTransfer = (productId: number) => {
    return stocks.filter(
      (stock) =>
        stock.productId === productId &&
        stockByWarehouseService.calculateAvailableStock(stock) > 0
    );
  };

  const getDestinationWarehouses = (
    productId: number,
    excludeWarehouseId?: number
  ) => {
    return stocks.filter(
      (stock) =>
        stock.productId === productId &&
        stock.warehouseId !== excludeWarehouseId
    );
  };

  const calculateMaxTransferQuantity = (
    fromStockId: string,
    requiredQuantity: number
  ): number => {
    const fromStock = stocks.find(
      (stock) => stock.id.toString() === fromStockId
    );
    if (!fromStock) return 0;

    const availableStock =
      stockByWarehouseService.calculateAvailableStock(fromStock);
    return Math.min(availableStock, requiredQuantity);
  };

  return {
    stocks,
    loading,
    error,
    transferStock,
    getAvailableWarehousesForTransfer,
    getDestinationWarehouses,
    calculateMaxTransferQuantity,
    refetch,
  };
};
