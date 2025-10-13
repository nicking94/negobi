import { useState, useEffect } from "react";
import {
  productLotService,
  ProductLot,
  CreateProductLotData,
  UpdateProductLotData,
  GetProductLotsParams,
} from "../../services/productLots/productLots.service";

// Definir el tipo para los filtros del hook
export interface UseProductLotsFilters {
  productId?: number;
  lotNumber?: string;
  currentWarehouseId?: number;
  expirationDate?: string;
  manufacturingDate?: string;
  search?: string;
}

export const useProductLots = (filters: UseProductLotsFilters = {}) => {
  const [productLots, setProductLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los lotes de productos con filtros
  const loadProductLots = async (
    customFilters?: Partial<UseProductLotsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetProductLotsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 1000,
      };

      console.log(
        "🔵 Enviando parámetros para lotes de productos:",
        combinedFilters
      );

      const productLotsData = await productLotService.getProductLots(
        combinedFilters
      );
      console.log("🟢 Datos de lotes de productos recibidos:", productLotsData);

      if (Array.isArray(productLotsData)) {
        setProductLots(productLotsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", productLotsData);
        setProductLots([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar lotes de productos"
      );
      setProductLots([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear lote de producto
  const createProductLot = async (
    productLotData: CreateProductLotData
  ): Promise<ProductLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const newProductLot = await productLotService.createProductLot(
        productLotData
      );
      setProductLots((prev) => [...prev, newProductLot]);
      return newProductLot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear lote de producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar lote de producto
  const updateProductLot = async (
    id: string,
    updates: UpdateProductLotData
  ): Promise<ProductLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProductLot = await productLotService.updateProductLot(
        id,
        updates
      );
      setProductLots((prev) =>
        prev.map((lot) => (lot.id.toString() === id ? updatedProductLot : lot))
      );
      return updatedProductLot;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar lote de producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar lote de producto
  const deleteProductLot = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await productLotService.deleteProductLot(id);
      setProductLots((prev) => prev.filter((lot) => lot.id.toString() !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar lote de producto"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener lote de producto por ID
  const getProductLotById = async (id: string): Promise<ProductLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const productLot = await productLotService.getProductLotById(id);
      return productLot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener lote de producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear múltiples lotes
  const createMultipleProductLots = async (
    productLotsData: CreateProductLotData[]
  ): Promise<ProductLot[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdLots = await productLotService.createMultipleProductLots(
        productLotsData
      );
      setProductLots((prev) => [...prev, ...createdLots]);
      return createdLots;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples lotes de productos"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ajustar cantidad de lote
  const adjustProductLotQuantity = async (
    id: string,
    adjustment: number
  ): Promise<ProductLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedLot = await productLotService.adjustProductLotQuantity(
        id,
        adjustment
      );
      setProductLots((prev) =>
        prev.map((lot) => (lot.id.toString() === id ? updatedLot : lot))
      );
      return updatedLot;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al ajustar cantidad del lote"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Transferir lote a otro warehouse
  const transferProductLotToWarehouse = async (
    id: string,
    warehouseId: number
  ): Promise<ProductLot | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedLot = await productLotService.transferProductLotToWarehouse(
        id,
        warehouseId
      );
      setProductLots((prev) =>
        prev.map((lot) => (lot.id.toString() === id ? updatedLot : lot))
      );
      return updatedLot;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al transferir lote");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar lotes de productos al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadProductLots();
  }, [
    filters.productId,
    filters.lotNumber,
    filters.currentWarehouseId,
    filters.expirationDate,
    filters.manufacturingDate,
    filters.search,
  ]);

  return {
    productLots,
    loading,
    error,
    createProductLot,
    updateProductLot,
    deleteProductLot,
    getProductLotById,
    createMultipleProductLots,
    adjustProductLotQuantity,
    transferProductLotToWarehouse,
    refetch: loadProductLots,
  };
};

// Hook especializado para lotes de un producto específico
export const useProductLotsByProduct = (productId?: number) => {
  const [productLots, setProductLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductLotsByProduct = async (id?: number) => {
    const targetProductId = id || productId;
    if (!targetProductId) {
      setError("productId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const lots = await productLotService.getProductLotsByProduct(
        targetProductId
      );
      setProductLots(lots);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar lotes del producto"
      );
      setProductLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductLotsByProduct();
    }
  }, [productId]);

  return {
    productLots,
    loading,
    error,
    refetch: loadProductLotsByProduct,
  };
};

// Hook especializado para lotes de un warehouse específico
export const useProductLotsByWarehouse = (warehouseId?: number) => {
  const [warehouseLots, setWarehouseLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWarehouseLots = async (id?: number) => {
    const targetWarehouseId = id || warehouseId;
    if (!targetWarehouseId) {
      setError("warehouseId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const lots = await productLotService.getProductLotsByWarehouse(
        targetWarehouseId
      );
      setWarehouseLots(lots);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar lotes del warehouse"
      );
      setWarehouseLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) {
      loadWarehouseLots();
    }
  }, [warehouseId]);

  return {
    warehouseLots,
    loading,
    error,
    refetch: loadWarehouseLots,
  };
};

// Hook especializado para lotes vencidos
export const useExpiredProductLots = () => {
  const [expiredLots, setExpiredLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpiredLots = async () => {
    try {
      setLoading(true);
      setError(null);
      const lots = await productLotService.getExpiredProductLots();
      setExpiredLots(lots);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar lotes vencidos"
      );
      setExpiredLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpiredLots();
  }, []);

  return {
    expiredLots,
    loading,
    error,
    refetch: loadExpiredLots,
  };
};

// Hook especializado para lotes próximos a vencer
export const useExpiringProductLots = (days: number = 30) => {
  const [expiringLots, setExpiringLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpiringLots = async (daysParam?: number) => {
    const targetDays = daysParam || days;

    try {
      setLoading(true);
      setError(null);
      const lots = await productLotService.getExpiringProductLots(targetDays);
      setExpiringLots(lots);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar lotes próximos a vencer"
      );
      setExpiringLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpiringLots();
  }, [days]);

  return {
    expiringLots,
    loading,
    error,
    refetch: loadExpiringLots,
  };
};

// Hook para gestión de inventario por lotes
export const useLotInventory = (productId?: number) => {
  const {
    productLots,
    loading,
    error,
    refetch,
    createProductLot,
    updateProductLot,
    adjustProductLotQuantity,
    transferProductLotToWarehouse,
  } = useProductLots({ productId });

  // Calcular inventario total
  const totalInventory = productLots.reduce(
    (total, lot) => total + lot.quantity,
    0
  );

  // Agregar lote al producto
  const addLot = async (
    lotNumber: string,
    quantity: number,
    warehouseId?: number,
    expirationDate?: string,
    manufacturingDate?: string
  ) => {
    if (!productId) {
      throw new Error("productId es requerido");
    }

    const lotData: CreateProductLotData = {
      product_id: productId,
      lot_number: lotNumber,
      quantity,
      currentWarehouseId: warehouseId,
      expiration_date: expirationDate,
      manufacturing_date: manufacturingDate,
    };

    return await createProductLot(lotData);
  };

  // Actualizar cantidad de lote específico
  const updateLotQuantity = async (lotId: string, newQuantity: number) => {
    return await updateProductLot(lotId, { quantity: newQuantity });
  };

  // Ajustar cantidad de lote específico
  const adjustLotQuantity = async (lotId: string, adjustment: number) => {
    return await adjustProductLotQuantity(lotId, adjustment);
  };

  // Transferir lote a otro warehouse
  const transferLot = async (lotId: string, warehouseId: number) => {
    return await transferProductLotToWarehouse(lotId, warehouseId);
  };

  // Obtener lote por número de lote
  const getLotByNumber = (lotNumber: string): ProductLot | undefined => {
    return productLots.find((lot) => lot.lot_number === lotNumber);
  };

  // Verificar si existe lote con un número específico
  const lotNumberExists = (lotNumber: string): boolean => {
    return productLots.some((lot) => lot.lot_number === lotNumber);
  };

  // Obtener cantidad total por warehouse
  const getQuantityByWarehouse = (warehouseId: number): number => {
    return productLots
      .filter((lot) => lot.currentWarehouseId === warehouseId)
      .reduce((total, lot) => total + lot.quantity, 0);
  };

  // Obtener lotes por warehouse
  const getLotsByWarehouse = (warehouseId: number): ProductLot[] => {
    return productLots.filter((lot) => lot.currentWarehouseId === warehouseId);
  };

  return {
    productLots,
    totalInventory,
    loading,
    error,
    addLot,
    updateLotQuantity,
    adjustLotQuantity,
    transferLot,
    getLotByNumber,
    lotNumberExists,
    getQuantityByWarehouse,
    getLotsByWarehouse,
    refetch,
  };
};

// Hook para cálculos de inventario por lotes
export const useLotInventoryCalculations = (productId?: number) => {
  const { productLots, loading, error } = useProductLotsByProduct(productId);

  const calculations = {
    // Inventario total
    totalQuantity: productLots.reduce((total, lot) => total + lot.quantity, 0),

    // Número de lotes diferentes
    totalLots: productLots.length,

    // Valor total del inventario
    totalValue: productLots.reduce(
      (total, lot) => total + lot.quantity * (lot.purchase_price || 0),
      0
    ),

    // Lote con mayor cantidad
    maxQuantityLot: productLots.reduce(
      (max, lot) => (lot.quantity > (max?.quantity || 0) ? lot : max),
      null as ProductLot | null
    ),

    // Lote con menor cantidad
    minQuantityLot: productLots.reduce(
      (min, lot) => (!min || lot.quantity < min.quantity ? lot : min),
      null as ProductLot | null
    ),

    // Cantidad promedio por lote
    averageQuantity:
      productLots.length > 0
        ? productLots.reduce((total, lot) => total + lot.quantity, 0) /
          productLots.length
        : 0,

    // Lotes vencidos
    expiredLots: productLots.filter((lot) => {
      if (!lot.expiration_date) return false;
      const expirationDate = new Date(lot.expiration_date);
      return expirationDate < new Date() && lot.quantity > 0;
    }),

    // Lotes próximos a vencer (30 días)
    expiringLots: productLots.filter((lot) => {
      if (!lot.expiration_date) return false;
      const expirationDate = new Date(lot.expiration_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return (
        expirationDate >= new Date() &&
        expirationDate <= thirtyDaysFromNow &&
        lot.quantity > 0
      );
    }),

    // Lotes con cantidad baja (menos de 10)
    lowQuantityLots: productLots.filter((lot) => lot.quantity < 10),

    // Lotes con cantidad cero
    zeroQuantityLots: productLots.filter((lot) => lot.quantity === 0),
  };

  return {
    calculations,
    productLots,
    loading,
    error,
  };
};

// Hook para alertas de vencimiento
export const useExpirationAlerts = (alertDays: number = 30) => {
  const { expiringLots, loading, error, refetch } =
    useExpiringProductLots(alertDays);
  const { expiredLots } = useExpiredProductLots();

  const alerts = {
    // Alertas críticas (vencidos)
    critical: expiredLots,

    // Alertas de advertencia (próximos a vencer)
    warning: expiringLots,

    // Total de alertas
    totalAlerts: expiredLots.length + expiringLots.length,

    // Valor total de inventario en alerta
    totalValueAtRisk: [...expiredLots, ...expiringLots].reduce(
      (total, lot) => total + lot.quantity * (lot.purchase_price || 0),
      0
    ),

    // Productos únicos en alerta
    uniqueProducts: Array.from(
      new Set([...expiredLots, ...expiringLots].map((lot) => lot.product_id))
    ).length,
  };

  return {
    alerts,
    expiredLots,
    expiringLots,
    loading,
    error,
    refetch,
  };
};

// Hook para transferencias entre warehouses
export const useLotTransfers = () => {
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const transferLotsBetweenWarehouses = async (
    lotIds: string[],
    fromWarehouseId: number,
    toWarehouseId: number
  ): Promise<boolean> => {
    if (lotIds.length === 0) {
      setTransferError("No se seleccionaron lotes para transferir");
      return false;
    }

    try {
      setTransferring(true);
      setTransferError(null);

      // Transferir cada lote
      for (const lotId of lotIds) {
        await productLotService.transferProductLotToWarehouse(
          lotId,
          toWarehouseId
        );
      }

      return true;
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Error al transferir lotes"
      );
      return false;
    } finally {
      setTransferring(false);
    }
  };

  const consolidateLots = async (
    targetLotId: string,
    sourceLotIds: string[],
    targetWarehouseId: number
  ): Promise<boolean> => {
    try {
      setTransferring(true);
      setTransferError(null);

      // Obtener el lote destino
      const targetLot = await productLotService.getProductLotById(targetLotId);

      // Calcular cantidad total a consolidar
      let totalQuantity = targetLot.quantity;

      for (const sourceLotId of sourceLotIds) {
        if (sourceLotId !== targetLotId) {
          const sourceLot = await productLotService.getProductLotById(
            sourceLotId
          );
          totalQuantity += sourceLot.quantity;

          // Eliminar el lote fuente después de consolidar
          await productLotService.deleteProductLot(sourceLotId);
        }
      }

      // Actualizar el lote destino con la nueva cantidad
      await productLotService.updateProductLot(targetLotId, {
        quantity: totalQuantity,
        currentWarehouseId: targetWarehouseId,
      });

      return true;
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Error al consolidar lotes"
      );
      return false;
    } finally {
      setTransferring(false);
    }
  };

  return {
    transferring,
    transferError,
    transferLotsBetweenWarehouses,
    consolidateLots,
  };
};
