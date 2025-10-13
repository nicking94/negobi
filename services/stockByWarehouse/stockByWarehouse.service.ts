import api from "../../utils/api";
import {
  PostStockByWarehouse,
  GetStockByWarehouse,
  GetStockByWarehouseById,
  PatchStockByWarehouse,
  DeleteStockByWarehouse,
  SyncStockByWarehouse,
} from "../stockByWarehouse/stockByWarehouse.route";

// Parámetros para obtener stock por almacén
export interface GetStockByWarehouseParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  warehouseId?: number;
  productId?: number;
}

// Interfaz principal del stock por almacén
export interface StockByWarehouse {
  // Campos principales
  id: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  reserve_stock: number;
  incoming_stock: number;
  location_in_warehouse: string;
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;
  erp_code_product: string;
  erp_code_warehouse: string;

  // Campos de relación (opcionales en response)
  warehouseId?: number;
  productId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Datos para crear stock por almacén
export interface CreateStockByWarehouseData {
  warehouseId: number;
  productId: number;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  reserve_stock?: number;
  incoming_stock?: number;
  location_in_warehouse?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  erp_code_product?: string;
  erp_code_warehouse?: string;
}

// Datos para actualizar stock por almacén
export interface UpdateStockByWarehouseData {
  warehouseId?: number;
  productId?: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  reserve_stock?: number;
  incoming_stock?: number;
  location_in_warehouse?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  erp_code_product?: string;
  erp_code_warehouse?: string;
}

// Datos para sincronización desde ERP
export interface SyncStockByWarehouseData {
  companyId: number;
  data: Array<{
    warehouseId: number;
    productId: number;
    stock: number;
    min_stock?: number;
    max_stock?: number;
    reserve_stock?: number;
    incoming_stock?: number;
    location_in_warehouse?: string;
    show_in_ecommerce?: boolean;
    show_in_sales_app?: boolean;
    erp_code_product?: string;
    erp_code_warehouse?: string;
  }>;
}

// Interfaces de respuesta
export interface StockByWarehouseResponse {
  success: boolean;
  data: StockByWarehouse;
}

export interface StockByWarehouseListResponse {
  success: boolean;
  data: StockByWarehouse[];
}

export interface PaginatedStockByWarehouseResponse {
  success: boolean;
  data: {
    data: StockByWarehouse[];
    totalPages: number;
    total: number;
  };
}

export interface SyncStockByWarehouseResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Interfaz para análisis de stock
export interface StockAnalysis {
  available_stock: number;
  reserved_stock: number;
  incoming_stock: number;
  total_physical_stock: number;
  stock_level: "LOW" | "NORMAL" | "HIGH" | "OUT_OF_STOCK";
  needs_replenishment: boolean;
  reorder_quantity?: number;
}

export const stockByWarehouseService = {
  // Crear un nuevo stock por almacén
  createStockByWarehouse: async (
    stockData: CreateStockByWarehouseData
  ): Promise<StockByWarehouse> => {
    const response = await api.post(PostStockByWarehouse, stockData);
    return response.data.data;
  },

  // Obtener todos los stocks por almacén
  getStockByWarehouse: async (
    params?: GetStockByWarehouseParams
  ): Promise<StockByWarehouse[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Parámetros opcionales
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.warehouseId) {
      queryParams.append("warehouseId", params.warehouseId.toString());
    }
    if (params?.productId) {
      queryParams.append("productId", params.productId.toString());
    }

    const response = await api.get(`${GetStockByWarehouse}?${queryParams}`);
    return response.data.data;
  },

  // Obtener un stock por almacén por ID
  getStockByWarehouseById: async (id: string): Promise<StockByWarehouse> => {
    const response = await api.get(`${GetStockByWarehouseById}/${id}`);
    return response.data.data;
  },

  // Actualizar un stock por almacén
  updateStockByWarehouse: async (
    id: string,
    updates: UpdateStockByWarehouseData
  ): Promise<StockByWarehouse> => {
    const response = await api.patch(`${PatchStockByWarehouse}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un stock por almacén
  deleteStockByWarehouse: async (id: string): Promise<void> => {
    await api.delete(`${DeleteStockByWarehouse}/${id}`);
  },

  // Sincronizar stocks desde ERP
  syncStockByWarehouse: async (
    syncData: SyncStockByWarehouseData
  ): Promise<SyncStockByWarehouseResponse> => {
    const response = await api.post(SyncStockByWarehouse, syncData);
    return response.data;
  },

  // Métodos adicionales útiles
  getStockByWarehouseAndProduct: async (
    warehouseId: number,
    productId: number
  ): Promise<StockByWarehouse | null> => {
    try {
      const stocks = await stockByWarehouseService.getStockByWarehouse({
        warehouseId,
        productId,
        itemsPerPage: 1,
      });
      return stocks.length > 0 ? stocks[0] : null;
    } catch (error) {
      console.error("Error getting stock by warehouse and product:", error);
      return null;
    }
  },

  getStockByWarehouseByWarehouseId: async (
    warehouseId: number
  ): Promise<StockByWarehouse[]> => {
    return stockByWarehouseService.getStockByWarehouse({
      warehouseId,
      itemsPerPage: 1000,
    });
  },

  getStockByProduct: async (productId: number): Promise<StockByWarehouse[]> => {
    return stockByWarehouseService.getStockByWarehouse({
      productId,
      itemsPerPage: 1000,
    });
  },

  // Actualizar cantidad de stock
  updateStockQuantity: async (
    id: string,
    newStock: number
  ): Promise<StockByWarehouse> => {
    return stockByWarehouseService.updateStockByWarehouse(id, {
      stock: newStock,
    });
  },

  // Ajustar cantidad de stock (sumar o restar)
  adjustStockQuantity: async (
    id: string,
    adjustment: number
  ): Promise<StockByWarehouse | null> => {
    try {
      const currentStock =
        await stockByWarehouseService.getStockByWarehouseById(id);
      const newStock = Math.max(0, currentStock.stock + adjustment);
      return stockByWarehouseService.updateStockQuantity(id, newStock);
    } catch (error) {
      console.error("Error adjusting stock quantity:", error);
      return null;
    }
  },

  // Actualizar stock de reserva
  updateReserveStock: async (
    id: string,
    newReserveStock: number
  ): Promise<StockByWarehouse> => {
    return stockByWarehouseService.updateStockByWarehouse(id, {
      reserve_stock: newReserveStock,
    });
  },

  // Actualizar stock entrante
  updateIncomingStock: async (
    id: string,
    newIncomingStock: number
  ): Promise<StockByWarehouse> => {
    return stockByWarehouseService.updateStockByWarehouse(id, {
      incoming_stock: newIncomingStock,
    });
  },

  // Calcular stock disponible (stock físico - reservas)
  calculateAvailableStock: (stockRecord: StockByWarehouse): number => {
    return Math.max(0, stockRecord.stock - stockRecord.reserve_stock);
  },

  // Analizar nivel de stock
  analyzeStockLevel: (stockRecord: StockByWarehouse): StockAnalysis => {
    const availableStock =
      stockByWarehouseService.calculateAvailableStock(stockRecord);
    const totalPhysicalStock = stockRecord.stock;

    let stockLevel: "LOW" | "NORMAL" | "HIGH" | "OUT_OF_STOCK";
    let needsReplenishment = false;
    let reorderQuantity: number | undefined;

    if (availableStock === 0) {
      stockLevel = "OUT_OF_STOCK";
      needsReplenishment = true;
      reorderQuantity =
        stockRecord.max_stock > 0 ? stockRecord.max_stock : undefined;
    } else if (
      stockRecord.min_stock > 0 &&
      availableStock <= stockRecord.min_stock
    ) {
      stockLevel = "LOW";
      needsReplenishment = true;
      reorderQuantity =
        stockRecord.max_stock > 0
          ? stockRecord.max_stock - availableStock
          : undefined;
    } else if (
      stockRecord.max_stock > 0 &&
      availableStock >= stockRecord.max_stock
    ) {
      stockLevel = "HIGH";
      needsReplenishment = false;
    } else {
      stockLevel = "NORMAL";
      needsReplenishment = false;
    }

    return {
      available_stock: availableStock,
      reserved_stock: stockRecord.reserve_stock,
      incoming_stock: stockRecord.incoming_stock,
      total_physical_stock: totalPhysicalStock,
      stock_level: stockLevel,
      needs_replenishment: needsReplenishment,
      reorder_quantity: reorderQuantity,
    };
  },

  // Verificar si hay stock suficiente
  hasSufficientStock: (
    stockRecord: StockByWarehouse,
    requiredQuantity: number
  ): boolean => {
    const availableStock =
      stockByWarehouseService.calculateAvailableStock(stockRecord);
    return availableStock >= requiredQuantity;
  },

  // Obtener productos con stock bajo
  getLowStockItems: async (
    warehouseId?: number
  ): Promise<StockByWarehouse[]> => {
    try {
      const stocks = warehouseId
        ? await stockByWarehouseService.getStockByWarehouse({
            warehouseId, // ✅ Pass as object property
            itemsPerPage: 1000,
          })
        : await stockByWarehouseService.getStockByWarehouse({
            itemsPerPage: 1000,
          });

      return stocks.filter((stock) => {
        const analysis = stockByWarehouseService.analyzeStockLevel(stock);
        return analysis.needs_replenishment;
      });
    } catch (error) {
      console.error("Error getting low stock items:", error);
      return [];
    }
  },

  // Obtener productos sin stock
  getOutOfStockItems: async (
    warehouseId?: number
  ): Promise<StockByWarehouse[]> => {
    try {
      const stocks = warehouseId
        ? await stockByWarehouseService.getStockByWarehouse({
            warehouseId, // ✅ Now correctly passed as object property
            itemsPerPage: 1000,
          })
        : await stockByWarehouseService.getStockByWarehouse({
            itemsPerPage: 1000,
          });

      return stocks.filter((stock) => {
        const analysis = stockByWarehouseService.analyzeStockLevel(stock);
        return analysis.stock_level === "OUT_OF_STOCK";
      });
    } catch (error) {
      console.error("Error getting out of stock items:", error);
      return [];
    }
  },
  // Transferir stock entre almacenes
  transferStock: async (
    fromStockId: string,
    toStockId: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      // Restar del stock origen
      const fromResult = await stockByWarehouseService.adjustStockQuantity(
        fromStockId,
        -quantity
      );
      if (!fromResult) {
        throw new Error("Error al restar del stock origen");
      }

      // Sumar al stock destino
      const toResult = await stockByWarehouseService.adjustStockQuantity(
        toStockId,
        quantity
      );
      if (!toResult) {
        // Revertir la operación si falla
        await stockByWarehouseService.adjustStockQuantity(
          fromStockId,
          quantity
        );
        throw new Error("Error al sumar al stock destino");
      }

      return true;
    } catch (error) {
      console.error("Error transferring stock:", error);
      return false;
    }
  },

  // Obtener stock total por producto (suma de todos los almacenes)
  getTotalStockByProduct: async (productId: number): Promise<number> => {
    try {
      const stocks = await stockByWarehouseService.getStockByProduct(productId);
      return stocks.reduce((total, stock) => total + stock.stock, 0);
    } catch (error) {
      console.error("Error getting total stock by product:", error);
      return 0;
    }
  },

  // Obtener stock disponible total por producto
  getTotalAvailableStockByProduct: async (
    productId: number
  ): Promise<number> => {
    try {
      const stocks = await stockByWarehouseService.getStockByProduct(productId);
      return stocks.reduce((total, stock) => {
        return total + stockByWarehouseService.calculateAvailableStock(stock);
      }, 0);
    } catch (error) {
      console.error("Error getting total available stock by product:", error);
      return 0;
    }
  },
};
